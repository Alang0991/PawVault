import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getAppUrl, requireStripe, stripeConnectEnabled } from '@/lib/stripe'
import { stripeLog } from '@/lib/stripe-logger'

export interface AccountSnapshot {
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  capabilities: Record<string, string> | null
  currentlyDue: string[]
  eventuallyDue: string[]
  disabledReason: string | null
  isDisabled: boolean
  isRestricted: boolean
  isDeleted: boolean
  defaultCurrency: string | null
  country: string | null
  email: string | null
  businessType: string | null
}

function pickSnapshot(account: Stripe.Account): AccountSnapshot {
  const capabilitiesObj = (account.capabilities as Record<string, string> | null | undefined) ?? null
  const currentlyDue: string[] = []
  const eventuallyDue: string[] = []
  let disabledReason: string | null = null

  const reqs = account.requirements
  if (reqs) {
    if (Array.isArray(reqs.currently_due)) currentlyDue.push(...reqs.currently_due)
    if (Array.isArray(reqs.eventually_due)) eventuallyDue.push(...reqs.eventually_due)
    if (Array.isArray(reqs.past_due) && reqs.past_due.length) currentlyDue.push(...reqs.past_due)
    disabledReason = reqs.disabled_reason ?? null
  }

  const isDisabled = !!disabledReason
  const isRestricted = !!(account.requirements?.currently_due?.length) || !account.charges_enabled

  return {
    chargesEnabled: !!account.charges_enabled,
    payoutsEnabled: !!account.payouts_enabled,
    detailsSubmitted: !!account.details_submitted,
    capabilities: capabilitiesObj,
    currentlyDue,
    eventuallyDue,
    disabledReason,
    isDisabled,
    isRestricted,
    isDeleted: !!account.deleted,
    defaultCurrency: account.default_currency ?? null,
    country: account.country ?? null,
    email: account.email ?? null,
    businessType: account.business_type ?? null,
  }
}

export async function createConnectedAccount(userId: string): Promise<string> {
  if (!stripeConnectEnabled()) {
    throw new Error('Stripe Connect is not enabled on this environment')
  }
  const stripe = requireStripe()

  const existing = await prisma.stripeConnectedAccount.findUnique({ where: { userId } })
  if (existing) return existing.stripeAccountId

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      pawvaultUserId: userId,
    },
  })

  await prisma.stripeConnectedAccount.create({
    data: {
      userId,
      stripeAccountId: account.id,
      accountType: 'express',
    },
  })

  return account.id
}

export async function createOnboardingLink(userId: string): Promise<{ url: string; expiresAt: number }> {
  const stripe = requireStripe()
  const acct = await prisma.stripeConnectedAccount.findUnique({ where: { userId } })
  if (!acct) throw new Error('Connected account does not exist for user')

  const appUrl = getAppUrl()
  const link = await stripe.accountLinks.create({
    account: acct.stripeAccountId,
    refresh_url: `${appUrl}/creator/payments?refresh=1`,
    return_url: `${appUrl}/creator/payments?return=1`,
    type: 'account_onboarding',
    collect: 'eventually_due',
  })

  stripeLog.info('Created Stripe account link', {
    creatorId: userId,
    stripeObjectId: acct.stripeAccountId,
    result: 'success',
  })

  return { url: link.url, expiresAt: link.expires_at }
}

export async function syncConnectedAccountFromStripe(userId: string, accountId?: string) {
  const stripe = requireStripe()
  const acct = await prisma.stripeConnectedAccount.findUnique({ where: { userId } })
  const targetId = accountId ?? acct?.stripeAccountId
  if (!targetId) return null

  const account = await stripe.accounts.retrieve(targetId)
  const snapshot = pickSnapshot(account)

  await prisma.stripeConnectedAccount.update({
    where: { stripeAccountId: targetId },
    data: {
      chargesEnabled: snapshot.chargesEnabled,
      payoutsEnabled: snapshot.payoutsEnabled,
      detailsSubmitted: snapshot.detailsSubmitted,
      capabilities: snapshot.capabilities ? JSON.stringify(snapshot.capabilities) : null,
      requirementsCurrentlyDue: snapshot.currentlyDue.length ? JSON.stringify(snapshot.currentlyDue) : null,
      requirementsEventuallyDue: snapshot.eventuallyDue.length ? JSON.stringify(snapshot.eventuallyDue) : null,
      requirementsDisabledReason: snapshot.disabledReason,
      isRestricted: snapshot.isRestricted,
      isDisabled: snapshot.isDisabled,
      isDeleted: snapshot.isDeleted,
      country: snapshot.country,
      defaultCurrency: snapshot.defaultCurrency,
      emailOnAccount: snapshot.email,
      businessType: snapshot.businessType,
      lastSyncedAt: new Date(),
    },
  })

  return snapshot
}

export async function applyAccountEvent(accountId: string) {
  const stripe = requireStripe()
  const account = await stripe.accounts.retrieve(accountId)
  const snapshot = pickSnapshot(account)
  await prisma.stripeConnectedAccount.update({
    where: { stripeAccountId: accountId },
    data: {
      chargesEnabled: snapshot.chargesEnabled,
      payoutsEnabled: snapshot.payoutsEnabled,
      detailsSubmitted: snapshot.detailsSubmitted,
      capabilities: snapshot.capabilities ? JSON.stringify(snapshot.capabilities) : null,
      requirementsCurrentlyDue: snapshot.currentlyDue.length ? JSON.stringify(snapshot.currentlyDue) : null,
      requirementsEventuallyDue: snapshot.eventuallyDue.length ? JSON.stringify(snapshot.eventuallyDue) : null,
      requirementsDisabledReason: snapshot.disabledReason,
      isRestricted: snapshot.isRestricted,
      isDisabled: snapshot.isDisabled,
      isDeleted: snapshot.isDeleted,
      country: snapshot.country,
      defaultCurrency: snapshot.defaultCurrency,
      emailOnAccount: snapshot.email,
      businessType: snapshot.businessType,
      lastSyncedAt: new Date(),
    },
  })
  stripeLog.info('Synced connected account from webhook', {
    stripeAccountId: accountId,
    result: 'success',
  })
  return snapshot
}

export async function disconnectConnectedAccount(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const acct = await prisma.stripeConnectedAccount.findUnique({ where: { userId } })
  if (!acct) return { ok: false, reason: 'not_connected' }

  const pendingPayments = await prisma.payment.count({
    where: { stripeAccountId: acct.stripeAccountId, status: { in: ['PENDING', 'PROCESSING'] } },
  })
  const pendingRefunds = await prisma.refund.count({
    where: { stripeAccountId: acct.stripeAccountId, status: { in: ['PENDING', 'PROCESSING'] } } })
  const openDisputes = await prisma.stripeDispute.count({
    where: { payment: { stripeAccountId: acct.stripeAccountId }, status: { in: ['NEEDS_RESPONSE', 'WARNING_RESPONSE', 'WARNING_UNDER_REVIEW', 'UNDER_REVIEW'] } },
  })
  const unpaidOrders = await prisma.order.count({
    where: { creatorId: userId, status: { in: ['PENDING', 'PROCESSING'] } },
  })

  if (pendingPayments + pendingRefunds + openDisputes + unpaidOrders > 0) {
    return { ok: false, reason: 'unresolved_financial_activity' }
  }

  await prisma.stripeConnectedAccount.update({
    where: { userId },
    data: { disconnectedAt: new Date(), isDisabled: true },
  })
  return { ok: true }
}