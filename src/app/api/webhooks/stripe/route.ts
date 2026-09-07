export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = ['iad1', 'arn1', 'fra1']

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe, getAppUrl } from '@/lib/stripe'
import { recordWebhookEvent, markWebhookProcessed, markWebhookFailed } from '@/lib/webhook-idempotency'
import { prisma } from '@/lib/prisma'
import { stripeLog } from '@/lib/stripe-logger'
import { ensureUniqueLicenseKey } from '@/lib/license'

export async function POST(request: Request) {
  const endpoint = 'payments'
  const stripe = getStripe()
  if (!stripe) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    stripeLog.error('Missing STRIPE_WEBHOOK_SECRET', { result: 'error', category: 'config', endpoint })
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    stripeLog.error('Invalid Stripe webhook signature', { result: 'error', category: 'signature', endpoint })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let record
  try {
    record = await recordWebhookEvent(event, endpoint)
  } catch (err) {
    stripeLog.error('Failed to record webhook event', { eventId: event.id, result: 'error', category: 'idempotency', endpoint })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (record.alreadyProcessed) {
    stripeLog.info('Webhook already processed, skipping', { eventId: event.id, eventType: event.type, result: 'skipped', endpoint })
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute)
        break
      case 'charge.dispute.updated':
        await handleDisputeUpdated(event.data.object as Stripe.Dispute)
        break
      case 'charge.dispute.closed':
        await handleDisputeClosed(event.data.object as Stripe.Dispute)
        break
      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer)
        break
      default:
        stripeLog.info('Unhandled payment webhook', { eventId: event.id, eventType: event.type, result: 'ignored', endpoint })
        break
    }
    await markWebhookProcessed(event.id)
    stripeLog.info('Processed webhook', { eventId: event.id, eventType: event.type, result: 'success', endpoint })
    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown'
    await markWebhookFailed(event.id, 'processing', message)
    stripeLog.error('Webhook handler error', { eventId: event.id, eventType: event.type, result: 'error', category: 'processing', endpoint })
    return NextResponse.json({ error: 'Handler error' }, { status: 200 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = typeof session.metadata?.pawvaultOrderId === 'string' ? session.metadata.pawvaultOrderId : null
  if (!orderId) {
    stripeLog.warn('Checkout session missing pawvaultOrderId', { stripeObjectId: session.id, result: 'ignored', endpoint: 'payments' })
    return
  }
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) {
    stripeLog.warn('Order not found for checkout session', { orderId, stripeObjectId: session.id, result: 'ignored', endpoint: 'payments' })
    return
  }
  await prisma.order.update({
    where: { id: order.id },
    data: {
      checkoutSessionId: session.id,
      paymentIntentId: (session.payment_intent as string) ?? order.paymentIntentId,
      status: 'PROCESSING',
    },
  })

  const existingPayment = await prisma.payment.findFirst({ where: { orderId: order.id } })
  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: order.currency,
        status: 'PROCESSING',
        provider: 'stripe',
        providerPaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        stripeAccountId: order.stripeAccountId ?? null,
        applicationFeeAmount: order.applicationFeeAmount,
      },
    })
  }
}

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findFirst({ where: { providerPaymentId: pi.id } })
  if (!payment) {
    const orderId = typeof pi.metadata?.pawvaultOrderId === 'string' ? pi.metadata.pawvaultOrderId : null
    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID', paidAt: new Date() },
      })

      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: (pi.amount_received ?? pi.amount) / 100,
          currency: (pi.currency ?? 'usd').toUpperCase(),
          status: 'SUCCEEDED',
          provider: 'stripe',
          providerPaymentId: pi.id,
          providerChargeId: typeof pi.latest_charge === 'string' ? pi.latest_charge : null,
          stripeAccountId: order.stripeAccountId ?? null,
          applicationFeeAmount: order.applicationFeeAmount,
        },
      })

      await createLicensesForOrder(order.id)
      await createAllocationsForOrder(order.id)
    }
    return
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'SUCCEEDED',
      providerChargeId: typeof pi.latest_charge === 'string' ? pi.latest_charge : payment.providerChargeId,
    },
  })

  const order = await prisma.order.findUnique({ where: { id: payment.orderId } })
  if (order && order.status !== 'PAID') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID', paidAt: new Date() },
    })
    if (!order.paymentIntentId) {
      await prisma.order.update({ where: { id: order.id }, data: { paymentIntentId: pi.id } })
    }

    await createLicensesForOrder(order.id)
    await createAllocationsForOrder(order.id)
  }
}

async function createAllocationsForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: true, creator: true },
  })
  if (!order || !order.creatorId) return

  const existing = await prisma.creatorAllocation.count({ where: { orderId } })
  if (existing > 0) return

  for (const item of order.items) {
    const gross = item.price * item.quantity
    const fee = item.platformFeeShare
    const net = item.creatorEarnings

    await prisma.creatorAllocation.create({
      data: {
        orderId: order.id,
        orderItemId: item.id,
        creatorId: order.creatorId,
        productId: item.productId,
        grossAmount: gross,
        discountAmount: 0,
        taxAmount: 0,
        platformFee: fee,
        netAmount: net,
        currency: order.currency,
      },
    })
  }
}

async function createLicensesForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  })

  if (!order || !order.buyerId) return

  for (const item of order.items) {
    const existing = await prisma.license.findFirst({
      where: { userId: order.buyerId, productId: item.productId },
    })

    if (existing) continue

    const licenseKey = await ensureUniqueLicenseKey()
    await prisma.license.create({
      data: {
        userId: order.buyerId,
        productId: item.productId,
        orderId: order.id,
        licenseKey,
        status: 'ACTIVE',
      },
    })
  }
}

async function handlePaymentIntentFailed(pi: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findFirst({ where: { providerPaymentId: pi.id } })
  if (!payment) {
    const orderId = typeof pi.metadata?.pawvaultOrderId === 'string' ? pi.metadata.pawvaultOrderId : null
    if (orderId) {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'FAILED' } })
      await prisma.payment.create({
        data: {
          orderId,
          amount: (pi.amount ?? 0) / 100,
          currency: (pi.currency ?? 'usd').toUpperCase(),
          status: 'FAILED',
          provider: 'stripe',
          providerPaymentId: pi.id,
          failureCode: pi.last_payment_error?.code ?? null,
          failureMessage: pi.last_payment_error?.message ?? null,
        },
      })
    }
    return
  }
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'FAILED', failureCode: pi.last_payment_error?.code ?? null, failureMessage: pi.last_payment_error?.message ?? null },
  })
  await prisma.order.update({ where: { id: payment.orderId }, data: { status: 'FAILED' } })
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const payment = await prisma.payment.findFirst({ where: { providerChargeId: charge.id } })
  if (!payment) {
    stripeLog.warn('Charge refunded with no matching payment', { stripeObjectId: charge.id, result: 'ignored', endpoint: 'payments' })
    return
  }
  const totalRefunded = (charge.amount_refunded ?? 0) / 100
  await prisma.payment.update({
    where: { id: payment.id },
    data: { amountRefunded: totalRefunded, status: 'REFUNDED' },
  })

  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    include: { items: true },
  })

  if (order) {
    const isFullyRefunded = totalRefunded >= payment.amount
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: isFullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundedAt: isFullyRefunded ? new Date() : order.refundedAt ?? undefined,
      },
    })

    if (order.buyerId) {
      for (const item of order.items) {
        await prisma.license.updateMany({
          where: { userId: order.buyerId, productId: item.productId, status: 'ACTIVE' },
          data: { status: 'REFUNDED', refundedAt: new Date() },
        })
      }
    }
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.id
  const payment = await prisma.payment.findFirst({ where: { providerChargeId: chargeId } })
  if (!payment) {
    stripeLog.warn('Dispute with no matching payment', { stripeObjectId: dispute.id, result: 'ignored', endpoint: 'payments' })
    return
  }
  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    include: { items: true },
  })

  await prisma.order.update({ where: { id: payment.orderId }, data: { status: 'DISPUTED' } })
  await prisma.stripeDispute.upsert({
    where: { stripeDisputeId: dispute.id },
    update: {
      amount: (dispute.amount ?? 0) / 100,
      currency: (dispute.currency ?? 'usd').toUpperCase(),
      reason: dispute.reason ?? null,
      status: dispute.status ?? 'NEEDS_RESPONSE',
      evidenceDueBy: dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000) : null,
      isChargeRefundable: !!dispute.is_charge_refundable,
      raw: JSON.stringify(dispute),
    },
    create: {
      paymentId: payment.id,
      orderId: payment.orderId,
      stripeDisputeId: dispute.id,
      stripeChargeId: chargeId,
      amount: (dispute.amount ?? 0) / 100,
      currency: (dispute.currency ?? 'usd').toUpperCase(),
      reason: dispute.reason ?? null,
      status: dispute.status ?? 'NEEDS_RESPONSE',
      evidenceDueBy: dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000) : null,
      isChargeRefundable: !!dispute.is_charge_refundable,
      raw: JSON.stringify(dispute),
    },
  })

  if (order?.buyerId) {
    for (const item of order.items) {
      await prisma.license.updateMany({
        where: { userId: order.buyerId, productId: item.productId, status: 'ACTIVE' },
        data: { status: 'DISPUTED', disputedAt: new Date() },
      })
    }
  }
}

async function handleDisputeUpdated(dispute: Stripe.Dispute) {
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.id
  await prisma.stripeDispute.updateMany({
    where: { stripeDisputeId: dispute.id },
    data: {
      status: dispute.status ?? 'NEEDS_RESPONSE',
      amount: (dispute.amount ?? 0) / 100,
      reason: dispute.reason ?? null,
      evidenceDueBy: dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000) : null,
      isChargeRefundable: !!dispute.is_charge_refundable,
      raw: JSON.stringify(dispute),
    },
  })
}

async function handleDisputeClosed(dispute: Stripe.Dispute) {
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.id
  await prisma.stripeDispute.updateMany({
    where: { stripeDisputeId: dispute.id },
    data: { status: dispute.status ?? 'NEEDS_RESPONSE', raw: JSON.stringify(dispute) },
  })
  const payment = await prisma.payment.findFirst({ where: { providerChargeId: chargeId } })
  if (payment) {
    const closedWon = ['won', 'response_needed', 'processing_review'].includes(dispute.status ?? '')
    const newOrderStatus = closedWon ? 'PAID' : 'REFUNDED'
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: newOrderStatus, refundedAt: !closedWon ? new Date() : null },
    })

    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: { items: true },
    })

    if (order?.buyerId) {
      const newLicenseStatus = closedWon ? 'ACTIVE' : 'REFUNDED'
      for (const item of order.items) {
        await prisma.license.updateMany({
          where: { userId: order.buyerId, productId: item.productId, status: 'DISPUTED' },
          data: {
            status: newLicenseStatus,
            refundedAt: !closedWon ? new Date() : null,
            disputedAt: closedWon ? null : undefined,
          },
        })
      }
    }
  }
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  const destination = typeof transfer.destination === 'string' ? transfer.destination : transfer.destination?.id
  if (destination) {
    await prisma.payment.updateMany({
      where: { stripeAccountId: destination },
      data: { providerChargeId: transfer.id },
    }).catch(() => undefined)
  }
}