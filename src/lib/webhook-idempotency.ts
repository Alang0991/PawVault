import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { stripeLog } from '@/lib/stripe-logger'

export type WebhookEndpoint = 'payments' | 'connect'

export async function recordWebhookEvent(event: Stripe.Event, endpoint: WebhookEndpoint): Promise<{ alreadyProcessed: boolean }> {
  try {
    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        apiVersion: event.api_version ?? null,
        livemode: !!event.livemode,
        accountId: (event as any).account ?? null,
        endpoint,
        status: 'PROCESSING',
        payload: JSON.stringify({ id: event.id, type: event.type }),
      },
    })
    return { alreadyProcessed: false }
  } catch (err: any) {
    if (err?.code === 'P2002') {
      const existing = await prisma.stripeWebhookEvent.findUnique({
        where: { stripeEventId: event.id },
      })
      if (existing && existing.status === 'COMPLETED') {
        return { alreadyProcessed: true }
      }
      if (existing && existing.status === 'PROCESSING') {
        return { alreadyProcessed: true }
      }
      return { alreadyProcessed: false }
    }
    throw err
  }
}

export async function markWebhookProcessed(eventId: string, category?: string) {
  await prisma.stripeWebhookEvent.update({
    where: { stripeEventId: eventId },
    data: {
      status: 'COMPLETED',
      processedAt: new Date(),
      errorCategory: category ?? null,
      errorMessage: null,
    },
  })
}

export async function markWebhookFailed(eventId: string, category: string, message: string) {
  await prisma.stripeWebhookEvent.update({
    where: { stripeEventId: eventId },
    data: {
      status: 'FAILED',
      processedAt: new Date(),
      errorCategory: category,
      errorMessage: message.slice(0, 500),
    },
  }).catch(() => undefined)

  stripeLog.error('Webhook processing failed', {
    eventId,
    category,
    result: 'error',
  })
}