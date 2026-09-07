export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { requireStripe } from '@/lib/stripe'
import { stripeLog } from '@/lib/stripe-logger'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'
import { z } from 'zod'

const retrySchema = z.object({
  transferId: z.string().min(1),
})

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = retrySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const transfer = await prisma.stripeTransfer.findUnique({
    where: { id: parsed.data.transferId },
    include: { allocations: true, order: true },
  })
  if (!transfer) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
  if (transfer.creatorId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (transfer.status !== 'FAILED') {
    return NextResponse.json({ error: 'Transfer is not in failed state' }, { status: 400 })
  }

  const stripe = requireStripe()

const destination = transfer.order.stripeAccountId
    if (!destination) {
      return NextResponse.json({ error: 'No Stripe account configured' }, { status: 400 })
    }

    try {
      const newTransfer = await stripe.transfers.create({
        amount: Math.round(transfer.amount * 100),
        currency: transfer.currency.toLowerCase(),
        destination,
        metadata: {
          pawvaultOrderId: transfer.orderId,
          pawvaultCreatorId: transfer.creatorId,
          retryOf: transfer.stripeTransferId,
        },
      })

    await prisma.stripeTransfer.update({
      where: { id: transfer.id },
      data: {
        stripeTransferId: newTransfer.id,
        status: 'PENDING',
        failureCode: null,
        failureMessage: null,
        updatedAt: new Date(),
      },
    })

    await prisma.creatorAllocation.updateMany({
      where: { transferId: transfer.id },
      data: { transferId: newTransfer.id },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.FINANCE_TRANSFER_RETRY,
      details: {
        originalTransferId: transfer.id,
        newTransferId: newTransfer.id,
        orderId: transfer.orderId,
        amount: transfer.amount,
      },
      entityType: 'transfer',
      entityId: newTransfer.id,
    })

    return NextResponse.json({ ok: true, transferId: newTransfer.id })
  } catch (err) {
    stripeLog.error('Transfer retry failed', {
      transferId: transfer.id,
      orderId: transfer.orderId,
      result: 'error',
      category: 'transfer_retry',
    })
    return NextResponse.json({ error: 'Could not retry transfer' }, { status: 502 })
  }
}