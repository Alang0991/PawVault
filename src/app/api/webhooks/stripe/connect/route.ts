export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { recordWebhookEvent, markWebhookProcessed, markWebhookFailed } from '@/lib/webhook-idempotency'
import { applyAccountEvent } from '@/lib/stripe-connect'
import { stripeLog } from '@/lib/stripe-logger'

export async function POST(request: Request) {
  const endpoint = 'connect'
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''
  const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET

  if (!secret) {
    stripeLog.error('Missing STRIPE_CONNECT_WEBHOOK_SECRET', { result: 'error', category: 'config', endpoint })
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-08-26.dahlia', typescript: true })
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    stripeLog.error('Invalid Connect webhook signature', { result: 'error', category: 'signature', endpoint })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let record
  try {
    record = await recordWebhookEvent(event, endpoint)
  } catch (err) {
    stripeLog.error('Failed to record Connect webhook event', { eventId: event.id, result: 'error', category: 'idempotency', endpoint })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (record.alreadyProcessed) {
    stripeLog.info('Connect webhook duplicate', { eventId: event.id, eventType: event.type, result: 'skipped', endpoint })
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case 'account.updated':
        await applyAccountEvent((event.data.object as Stripe.Account).id)
        break
      case 'account.application.deauthorized':
        await prisma.stripeConnectedAccount.updateMany({
          where: { stripeAccountId: typeof (event.data.object as any).account === 'string' ? (event.data.object as any).account : '' },
          data: { isRestricted: true, isDisabled: true, disconnectedAt: new Date() },
        })
        break
      default:
        stripeLog.info('Unhandled Connect webhook', { eventId: event.id, eventType: event.type, result: 'ignored', endpoint })
        break
    }
    await markWebhookProcessed(event.id)
    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown'
    await markWebhookFailed(event.id, 'processing', message)
    stripeLog.error('Connect webhook handler error', { eventId: event.id, eventType: event.type, result: 'error', category: 'processing', endpoint })
    return NextResponse.json({ error: 'Handler error' }, { status: 200 })
  }
}