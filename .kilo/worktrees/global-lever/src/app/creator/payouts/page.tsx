import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatPrice, formatDate } from "@/lib/helpers"
import Link from "next/link"
import { 
  DollarSign, 
  Clock, 
  CreditCard, 
  Settings, 
  FileText,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from "lucide-react"

export const dynamic = "force-dynamic"

async function getPayoutData(userId: string) {
  const [payouts, stripeAccount, user] = await Promise.all([
    prisma.payout.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.stripeConnectedAccount.findUnique({
      where: { userId },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        displayName: true, 
        username: true, 
        avatar: true,
        role: true 
      },
    }),
  ])

  const totalPaid = payouts
    .filter((p) => p.status === "PAID" || p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingPayouts = payouts
    .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((sum, p) => sum + p.amount, 0)

  // Get pending balance from allocations (unpaid earnings)
  const [pendingAllocations] = await Promise.all([
    prisma.creatorAllocation.findMany({
      where: { 
        creatorId: userId, 
        isReversed: false,
        payoutId: null,
      },
      select: { netAmount: true },
    }),
  ])

  const pendingBalance = pendingAllocations.reduce((sum, a) => sum + a.netAmount, 0)

  return {
    payouts,
    stripeAccount,
    user,
    totalPaid,
    pendingPayouts,
    pendingBalance,
    availableBalance: Math.max(0, pendingBalance - pendingPayouts),
  }
}

export default async function PayoutsPage() {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN", "FOUNDER"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const data = await getPayoutData(user.id)

  const isStripeConnected = data.stripeAccount?.chargesEnabled && data.stripeAccount?.payoutsEnabled
  const needsOnboarding = data.stripeAccount && (!data.stripeAccount.detailsSubmitted || !isStripeConnected)
  const payoutsEnabled = isStripeConnected

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payouts</h1>
            <p className="text-text-secondary">Manage your earnings, payouts, and tax information</p>
          </div>
          {!data.stripeAccount && (
            <Button asChild>
              <Link href="/api/creator/stripe/connect" className="w-full">
                Connect Stripe Account
              </Link>
            </Button>
          )}
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Available Balance
              </CardTitle>
              <p className="text-3xl font-bold mt-2 text-green-600">
                {formatPrice(data.availableBalance)}
              </p>
              <p className="text-sm text-text-muted mt-1">
                Ready to withdraw
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Pending Balance
              </CardTitle>
              <p className="text-3xl font-bold mt-2 text-amber-600">
                {formatPrice(data.pendingBalance)}
              </p>
              <p className="text-sm text-text-muted mt-1">
                Includes processing payouts
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Total Paid Out
              </CardTitle>
              <p className="text-3xl font-bold mt-2">
                {formatPrice(data.totalPaid)}
              </p>
              <p className="text-sm text-text-muted mt-1">
                Lifetime payouts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stripe Connect Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Connect Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.stripeAccount ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${isStripeConnected ? "bg-green-50 dark:bg-green-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isStripeConnected ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                    <span className="font-medium">
                      {isStripeConnected ? "Active" : "Onboarding Required"}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">
                    {isStripeConnected 
                      ? "Payouts enabled - you can receive payments" 
                      : "Complete Stripe onboarding to enable payouts"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-text-muted">Account ID</p>
                  <p className="font-mono text-sm">{data.stripeAccount.stripeAccountId}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-text-muted">Payouts Enabled</p>
                  <p className="font-medium">
                    {data.stripeAccount.payoutsEnabled ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-text-muted mb-4">Stripe Connect not set up</p>
                <Button asChild>
                  <Link href="/api/creator/stripe/connect">
                    Connect Stripe Account
                  </Link>
                </Button>
              </div>
            )}
            {needsOnboarding && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  Complete Stripe onboarding to enable payouts. 
                  <Button asChild variant="ghost" className="ml-2 h-auto p-0 text-amber-600 hover:text-amber-800">
                    <Link href="/api/creator/stripe/connect">Continue onboarding</Link>
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Payout Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payoutsEnabled ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Payout Schedule</label>
                  <select className="w-full border rounded-md px-3 py-2 bg-background">
                    <option value="daily">Daily</option>
                    <option value="weekly" selected>Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="manual">Manual</option>
                  </select>
                  <p className="text-xs text-text-muted mt-1">
                    Automatic payouts on the selected schedule
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Payout Amount</label>
                  <input 
                    type="number" 
                    min="1" 
                    step="1"
                    defaultValue="25"
                    className="w-full border rounded-md px-3 py-2 bg-background"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Minimum balance required for automatic payout (USD)
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-text-muted mb-4">
                  Connect Stripe to configure payout settings
                </p>
                <Button asChild>
                  <Link href="/api/creator/stripe/connect">
                    Connect Stripe Account
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-text-muted mb-4">
                Tax information is required for payouts. This information is used to generate 
                1099 forms (US) or equivalent tax documents for other jurisdictions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Legal Name</label>
                  <input type="text" className="w-full border rounded-md px-3 py-2 bg-background" placeholder="Your legal name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax ID / SSN / EIN</label>
                  <input type="text" className="w-full border rounded-md px-3 py-2 bg-background" placeholder="Tax identification number" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <select className="w-full border rounded-md px-3 py-2 bg-background">
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="EU">European Union</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State/Province</label>
                  <input type="text" className="w-full border rounded-md px-3 py-2 bg-background" placeholder="State or province" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea className="w-full border rounded-md px-3 py-2 bg-background" rows={2} placeholder="Street address, city, postal code" />
                </div>
              </div>
              <Button className="mt-4">Save Tax Information</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Payout History
              <span className="text-sm text-text-muted">{data.payouts.length} payouts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.payouts.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-text-muted">No payouts yet.</p>
                {data.stripeAccount && !payoutsEnabled && (
                  <p className="text-sm text-text-muted mt-2">
                    Complete Stripe onboarding to start receiving payouts.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {data.payouts.map((payout) => (
                  <div key={payout.id} className="border-b last:border-0 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        payout.status === "PAID" || payout.status === "COMPLETED" 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600" 
                          : payout.status === "FAILED" 
                          ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                      }`}>
                        {payout.status === "PAID" || payout.status === "COMPLETED" ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : payout.status === "FAILED" ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{formatPrice(payout.amount)}</p>
                        <p className="text-sm text-text-muted">
                          {formatDate(payout.createdAt)}
                          {payout.processedAt && ` · Paid ${formatDate(payout.processedAt)}`}
                        </p>
                        <p className="text-xs text-text-muted">
                          Method: {payout.method || "Stripe"} 
                          {payout.currency && ` · ${payout.currency}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        payout.status === "PAID" || payout.status === "COMPLETED" ? "default" :
                        payout.status === "FAILED" ? "destructive" : "secondary"
                      }>
                        {payout.status}
                      </Badge>
                      {payout.stripePayoutId && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link 
                            href={`https://dashboard.stripe.com/payouts/${payout.stripePayoutId}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}