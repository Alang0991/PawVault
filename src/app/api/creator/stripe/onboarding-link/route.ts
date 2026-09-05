export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { createOnboardingLink } from '@/lib/stripe-connect'
import { stripeConnectEnabled } from '@/lib/stripe'
import { stripeLog } from '@/lib/stripe-logger'

export async function POST() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!stripeConnectEnabled()) return NextResponse.json({ error: 'Stripe Connect disabled' }, { status: 503 })

  try {
    const link = await createOnboardingLink(user.id)
    return NextResponse.json({ url: link.url, expiresAt: link.expiresAt })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    stripeLog.error('Failed to create onboarding link', { creatorId: user.id, result: 'error', category: 'connect_account_link' })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}