export const dynamic = 'force-dynamic'

import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  CreditCard,
  Unplug,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
} from 'lucide-react'

export default async function CreatorPaymentsPage() {
  const user = await getServerUser()
  if (!user) redirect('/auth/signin')
  if (!['CREATOR', 'VERIFIED_CREATOR', 'ADMIN', 'FOUNDER'].includes(user.role)) {
    redirect('/creator/dashboard')
  }

  const acct = await prisma.stripeConnectedAccount.findUnique({ where: { userId: user.id } })

  let chargesEnabled = false
  let payoutsEnabled = false
  let detailsSubmitted = false
  let requirementsDue: string[] = []
  let eventuallyDue: string[] = []
  let isRestricted = false
  let isDisabled = false
  let isDeleted = false
  let defaultCurrency = 'USD'
  let country: string | null = null
  let emailOnAccount: string | null = null
  let businessType: string | null = null

  if (acct) {
    chargesEnabled = acct.chargesEnabled
    payoutsEnabled = acct.payoutsEnabled
    detailsSubmitted = acct.detailsSubmitted
    isRestricted = acct.isRestricted
    isDisabled = acct.isDisabled
    isDeleted = acct.isDeleted
    defaultCurrency = acct.defaultCurrency ?? 'USD'
    country = acct.country
    emailOnAccount = acct.emailOnAccount
    businessType = acct.businessType
    try { requirementsDue = JSON.parse(acct.requirementsCurrentlyDue || '[]') } catch { requirementsDue = [] }
    try { eventuallyDue = JSON.parse(acct.requirementsEventuallyDue || '[]') } catch { eventuallyDue = [] }
  }

  const canReceivePayments = !isDisabled && !isRestricted && chargesEnabled && payoutsEnabled
  const needsOnboarding = !acct || (!detailsSubmitted && requirementsDue.length > 0) || !chargesEnabled || !payoutsEnabled

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payments & Payouts</h1>
            <p className="text-gray-600 dark:text-gray-400">Connect a Stripe account to receive earnings.</p>
          </div>
        </div>

        {!acct && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Connect Stripe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                You have not connected a Stripe account yet. Connect one to receive marketplace payments.
              </p>
              <form action="/api/creator/stripe/connect" method="POST">
                <Button type="submit" className="gradient-bg text-white w-full">
                  Connect Stripe <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {acct && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Stripe Account
                  </span>
                  {canReceivePayments ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Action Required
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Account ID</span><span className="font-mono">{acct.stripeAccountId}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Charges Enabled</span><span>{chargesEnabled ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Payouts Enabled</span><span>{payoutsEnabled ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Details Submitted</span><span>{detailsSubmitted ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Currency</span><span>{defaultCurrency}</span></div>
                {country && <div className="flex justify-between"><span className="text-gray-500">Country</span><span>{country}</span></div>}
                {emailOnAccount && <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{emailOnAccount}</span></div>}
                {businessType && <div className="flex justify-between"><span className="text-gray-500">Business Type</span><span>{businessType}</span></div>}
              </CardContent>
            </Card>

            {needsOnboarding && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-5 w-5" /> Stripe setup required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-red-800 dark:text-red-200">
                  {!chargesEnabled && <p>Charges are not enabled on this account.</p>}
                  {!payoutsEnabled && <p>Payouts are not enabled.</p>}
                  {requirementsDue.length > 0 && (
                    <p>Outstanding requirements: {requirementsDue.join(', ')}</p>
                  )}
                  {isRestricted && <p>This account is restricted.</p>}
                  {isDisabled && <p>This account is disabled.</p>}
                  <form action="/api/creator/stripe/onboarding-link" method="POST">
                    <Button type="submit" className="w-full">Continue Stripe Onboarding</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {!needsOnboarding && eventuallyDue.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <Clock className="h-5 w-5" /> Upcoming requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                  <p>Stripe will eventually require: {eventuallyDue.join(', ')}. Continue onboarding now to avoid delays.</p>
                  <form action="/api/creator/stripe/onboarding-link" method="POST">
                    <Button type="submit" variant="outline" className="w-full">Continue Stripe Onboarding</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle>Disconnect</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Disconnecting will stop future payouts. Historical payment records are preserved.
                </p>
                <form action="/api/creator/stripe/disconnect" method="POST">
                  <Button type="submit" variant="destructive" className="w-full"><Unplug className="mr-2 h-4 w-4" /> Disconnect Stripe</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}