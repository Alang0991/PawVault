export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { requireStripe } from '@/lib/stripe'
import { stripeLog } from '@/lib/stripe-logger'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'
import { z } from 'zod'

const refundSchema = z.object({
  orderId: z.string().min(1),
  itemIds: z.array(z.string()).min(1).optional(),
  amount: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
  isPartial: z.boolean().default(false),
})

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = refundSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: {
      items: true,
      payments: true,
      refunds: true,
      creator: true,
    },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.creatorId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payment = order.payments[0]
  if (!payment) return NextResponse.json({ error: 'No payment found' }, { status: 400 })

  // Determine refund amount
  let refundAmount: number
  if (parsed.data.isPartial && parsed.data.amount) {
    refundAmount = parsed.data.amount
  } else if (parsed.data.itemIds && parsed.data.itemIds.length > 0) {
    refundAmount = order.items
      .filter((item) => parsed.data.itemIds!.includes(item.id))
      .reduce((s, item) => s + item.price * item.quantity, 0)
  } else {
    refundAmount = payment.amount - payment.amountRefunded
  }

  if (refundAmount <= 0) {
    return NextResponse.json({ error: 'Invalid refund amount' }, { status: 400 })
  }

  const stripe = requireStripe()
  let stripeRefundId: string | null = null

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.providerPaymentId ?? undefined,
      amount: Math.round(refundAmount * 100),
      currency: order.currency.toLowerCase(),
      reason: parsed.data.reason,
      metadata: {
        pawvaultOrderId: order.id,
        pawvaultCreatorId: order.creatorId,
        isPartial: String(parsed.data.isPartial),
        itemIds: JSON.stringify(parsed.data.itemIds ?? []),
      },
    })
    stripeRefundId = refund.id
  } catch (err) {
    stripeLog.error('Failed to create Stripe refund', {
      orderId: order.id,
      creatorId: order.creatorId,
      result: 'error',
      category: 'refund_create',
    })
    return NextResponse.json({ error: 'Could not create refund' }, { status: 502 })
  }

  // Record refund with ownership tracking
  const refundRecord = await prisma.refund.create({
    data: {
      orderId: order.id,
      paymentId: payment.id,
      amount: refundAmount,
      currency: order.currency,
      reason: parsed.data.reason ?? null,
      status: 'PROCESSING',
      provider: 'stripe',
      providerRefundId: stripeRefundId,
      stripeAccountId: order.stripeAccountId ?? null,
    },
  })

  // Reverse allocations for refunded items
  const allocations = await prisma.creatorAllocation.findMany({
    where: { orderId: order.id },
    include: { orderItem: true },
  })

  for (const allocation of allocations) {
    const isRefunded = parsed.data.isPartial
      ? parsed.data.itemIds
        ? parsed.data.itemIds.includes(allocation.orderItemId)
        : false
      : true

    if (isRefunded && !allocation.isReversed) {
      await prisma.creatorAllocation.update({
        where: { id: allocation.id },
        data: {
          isReversed: true,
          reversedAt: new Date(),
          netAmount: 0,
        },
      })
    }
  }

  await createAuditLog({
    userId: user.id,
    action: AuditActions.PAYMENT_REFUND_REQUESTED,
    details: {
      orderId: order.id,
      refundId: refundRecord.id,
      stripeRefundId,
      amount: refundAmount,
      isPartial: parsed.data.isPartial,
      creatorId: order.creatorId,
    },
    entityType: 'refund',
    entityId: refundRecord.id,
  })

  return NextResponse.json({ ok: true, refundId: refundRecord.id, stripeRefundId })
}