export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { disconnectConnectedAccount } from '@/lib/stripe-connect'
import { stripeConnectEnabled } from '@/lib/stripe'
import { stripeLog } from '@/lib/stripe-logger'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'

export async function POST() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!stripeConnectEnabled()) return NextResponse.json({ error: 'Stripe Connect disabled' }, { status: 503 })

  try {
    const result = await disconnectConnectedAccount(user.id)
    await createAuditLog({
      userId: user.id,
      action: AuditActions.SECURITY_SUSPICIOUS_ACTIVITY,
      details: { event: 'stripe_connect_disconnect', result },
    })
    if (!result.ok) {
      return NextResponse.json({ error: result.reason || 'cannot_disconnect' }, { status: 409 })
    }
    return NextResponse.json({ disconnected: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    stripeLog.error('Failed to disconnect Connect account', { creatorId: user.id, result: 'error', category: 'connect_disconnect' })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}