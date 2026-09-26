export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/session'
import { requireStripe, stripeConnectEnabled } from '@/lib/stripe'
import { createConnectedAccount, createOnboardingLink, syncConnectedAccountFromStripe } from '@/lib/stripe-connect'
import { stripeLog } from '@/lib/stripe-logger'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'

const bodySchema = z.object({}).optional()

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['CREATOR', 'VERIFIED_CREATOR', 'ADMIN', 'FOUNDER'].includes(user.role)) {
    return NextResponse.json({ error: 'Creator account required' }, { status: 403 })
  }
  if (!stripeConnectEnabled()) {
    return NextResponse.json({ error: 'Stripe Connect is not enabled' }, { status: 503 })
  }
  try {
    bodySchema.parse(await request.json().catch(() => ({})))
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
  }

  try {
    requireStripe()
  } catch (err) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  try {
    const accountId = await createConnectedAccount(user.id)
    const link = await createOnboardingLink(user.id)

    await createAuditLog({
      userId: user.id,
      action: AuditActions.SECURITY_SUSPICIOUS_ACTIVITY,
      details: { event: 'stripe_connect_onboarding_started', stripeAccountId: accountId },
    })

    return NextResponse.json({
      accountId,
      onboardingUrl: link.url,
      expiresAt: link.expiresAt,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    stripeLog.error('Failed to start Connect onboarding', { creatorId: user.id, result: 'error', category: 'connect_onboarding' })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const acct = await prisma.stripeConnectedAccount.findUnique({ where: { userId: user.id } })
  if (!acct) return NextResponse.json({ connected: false })

  try {
    await syncConnectedAccountFromStripe(user.id, acct.stripeAccountId)
  } catch (err) {
    stripeLog.warn('Sync of connected account from Stripe failed', { creatorId: user.id, stripeAccountId: acct.stripeAccountId })
  }

  const fresh = await prisma.stripeConnectedAccount.findUnique({ where: { userId: user.id } })
  return NextResponse.json({ connected: true, account: fresh })
}