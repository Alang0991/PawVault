export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { requireStripe } from '@/lib/stripe'
import { getPlatformFeeConfig, calculatePlatformFee, calculateCreatorEarnings, toStripeAmount } from '@/lib/platform-fees'
import { stripeLog } from '@/lib/stripe-logger'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'
import { z } from 'zod'

const createSchema = z.object({
  orderId: z.string().min(1),
})

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: {
      items: { include: { product: { include: { creator: true } } } },
      payments: true,
      orderGroup: true,
    },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.creatorId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const stripe = requireStripe()
  const feeConfig = await getPlatformFeeConfig()

  // Create allocation ledger entries
  const allocations = []
  for (const item of order.items) {
    const gross = item.price * item.quantity
    const fee = calculatePlatformFee(gross, feeConfig.feePercent)
    const net = calculateCreatorEarnings(gross, fee)

    const allocation = await prisma.creatorAllocation.create({
      data: {
        orderId: order.id,
        orderItemId: item.id,
        creatorId: order.creatorId,
        productId: item.productId,
        grossAmount: gross,
        discountAmount: item.platformFeeShare,
        taxAmount: 0,
        platformFee: fee,
        netAmount: net,
        currency: order.currency,
      },
    })
    allocations.push(allocation)
  }

  const totalNet = allocations.reduce((s, a) => s + a.netAmount, 0)

  // Create Stripe transfer
  let transferId: string | null = null
  const destination = order.stripeAccountId
  if (!destination) {
    return NextResponse.json({ error: 'No Stripe account configured' }, { status: 400 })
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: toStripeAmount(totalNet),
      currency: feeConfig.currency.toLowerCase(),
      destination,
      metadata: {
        pawvaultOrderId: order.id,
        pawvaultCreatorId: order.creatorId,
        allocationCount: String(allocations.length),
      },
    })
    transferId = transfer.id

    await prisma.stripeTransfer.create({
      data: {
        orderId: order.id,
        creatorId: order.creatorId,
        paymentId: order.payments[0]?.id ?? null,
        stripeTransferId: transfer.id,
        amount: totalNet,
        currency: feeConfig.currency,
        status: 'PENDING',
      },
    })

    // Link allocations to transfer
    for (const allocation of allocations) {
      await prisma.creatorAllocation.update({
        where: { id: allocation.id },
        data: { transferId: transfer.id },
      })
    }
  } catch (err) {
    stripeLog.error('Failed to create Stripe transfer', {
      orderId: order.id,
      creatorId: order.creatorId,
      result: 'error',
      category: 'transfer_create',
    })
    return NextResponse.json({ error: 'Could not create transfer' }, { status: 502 })
  }

  await createAuditLog({
    userId: user.id,
    action: AuditActions.ORDER_COMPLETED,
    details: {
      orderId: order.id,
      transferId,
      allocationCount: allocations.length,
      totalNet,
    },
    entityType: 'transfer',
    entityId: transferId ?? undefined,
  })

  return NextResponse.json({ ok: true, transferId, allocations: allocations.length })
}