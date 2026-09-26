export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { requireStripe } from '@/lib/stripe'
import { stripeLog } from '@/lib/stripe-logger'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'
import { z } from 'zod'

const createSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  reason: z.string().max(500).optional(),
  isPartial: z.boolean().default(false),
})

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    return NextResponse.json(
      { error: first?.message || "Invalid request", code: "VALIDATION_ERROR" },
      { status: 400 },
    )
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { payments: true, creator: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.creatorId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payment = order.payments[0]
  if (!payment) return NextResponse.json({ error: 'No payment found' }, { status: 400 })

  if (parsed.data.amount > payment.amount - payment.amountRefunded) {
    return NextResponse.json({ error: 'Refund amount exceeds available' }, { status: 400 })
  }

  const stripe = requireStripe()
  let stripeRefundId: string | null = null

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.providerPaymentId ?? undefined,
      amount: Math.round(parsed.data.amount * 100),
      currency: order.currency.toLowerCase(),
      reason: parsed.data.reason,
      metadata: {
        pawvaultOrderId: order.id,
        pawvaultCreatorId: order.creatorId,
        isPartial: String(parsed.data.isPartial),
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

  const refundRecord = await prisma.refund.create({
    data: {
      orderId: order.id,
      paymentId: payment.id,
      amount: parsed.data.amount,
      currency: order.currency,
      reason: parsed.data.reason ?? null,
      status: 'PROCESSING',
      provider: 'stripe',
      providerRefundId: stripeRefundId,
      stripeAccountId: order.stripeAccountId ?? null,
    },
  })

  // Reverse allocations
  const allocations = await prisma.creatorAllocation.findMany({
    where: { orderId: order.id },
  })
  const refundRatio = parsed.data.amount / payment.amount
  for (const allocation of allocations) {
    if (!allocation.isReversed) {
      await prisma.creatorAllocation.update({
        where: { id: allocation.id },
        data: {
          isReversed: parsed.data.isPartial ? false : true,
          reversedAt: parsed.data.isPartial ? undefined : new Date(),
          netAmount: parsed.data.isPartial
            ? Math.max(0, allocation.netAmount * (1 - refundRatio))
            : 0,
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
      amount: parsed.data.amount,
      isPartial: parsed.data.isPartial,
      creatorId: order.creatorId,
    },
    entityType: 'refund',
    entityId: refundRecord.id,
  })

  return NextResponse.json({ ok: true, refundId: refundRecord.id, stripeRefundId })
}