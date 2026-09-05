export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/session'
import { requireStripe } from '@/lib/stripe'
import { stripeLog } from '@/lib/stripe-logger'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'

const bodySchema = z.object({
  amount: z.number().positive(),
  reason: z.string().optional(),
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { payments: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (!['CREATOR', 'VERIFIED_CREATOR', 'ADMIN', 'OWNER'].includes(user.role) && order.buyerId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })

  const payment = order.payments[0]
  if (!payment || !payment.providerChargeId) {
    return NextResponse.json({ error: 'No Stripe charge found for this order' }, { status: 400 })
  }

  if (order.status === 'REFUNDED') {
    return NextResponse.json({ error: 'Order is already refunded' }, { status: 400 })
  }

  const refundAmount = Math.min(parsed.data.amount, order.total - (payment.amountRefunded ?? 0))
  if (refundAmount <= 0) {
    return NextResponse.json({ error: 'Nothing left to refund' }, { status: 400 })
  }

  try {
    const stripe = requireStripe()
    const stripeRefund = await stripe.refunds.create({
      charge: payment.providerChargeId,
      amount: Math.round(refundAmount * 100),
      reason: parsed.data.reason as Stripe.RefundCreateParams.Reason | undefined,
      metadata: {
        pawvaultOrderId: order.id,
        pawvaultPaymentId: payment.id,
      },
    })

    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        paymentId: payment.id,
        amount: refundAmount,
        currency: order.currency,
        reason: parsed.data.reason,
        status: 'SUCCEEDED',
        provider: 'stripe',
        providerRefundId: stripeRefund.id,
        stripeAccountId: order.stripeAccountId ?? null,
      },
    })

    const newAmountRefunded = (payment.amountRefunded ?? 0) + refundAmount
    const newStatus = newAmountRefunded >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
    const orderStatus = newAmountRefunded >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED'

    await prisma.payment.update({
      where: { id: payment.id },
      data: { amountRefunded: newAmountRefunded, status: newStatus },
    })
    await prisma.order.update({
      where: { id: order.id },
      data: { status: orderStatus, refundedAt: orderStatus === 'REFUNDED' ? new Date() : order.refundedAt ?? undefined },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.ORDER_REFUNDED,
      details: { orderId: order.id, paymentId: payment.id, refundId: refund.id, amount: refundAmount },
    })

    return NextResponse.json({ refund }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    stripeLog.error('Refund failed', { orderId: order.id, creatorId: order.creatorId ?? undefined, result: 'error', category: 'refund' })
    return NextResponse.json({ error: message }, { status: 502 })
  }
}