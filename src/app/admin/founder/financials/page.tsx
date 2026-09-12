import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { DollarSign, TrendingUp, PiggyBank, CreditCard, RefreshCw, Calendar } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function FounderFinancialsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const [orders, payouts, financeConfig] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { status: { in: ["PAID", "COMPLETED"] } },
    }),
    prisma.payout.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { username: true, displayName: true } } },
    }),
    prisma.financeConfig.findUnique({ where: { id: "singleton" } }),
  ])

  const totalRevenue = orders._sum.total ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financials</h1>
        <p className="text-sm text-muted-foreground">
          Platform revenue, creator revenue, payouts, taxes and payment settings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Total revenue</p>
            <p className="text-xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Platform fees</p>
            <p className="text-xl font-bold">${((totalRevenue * (financeConfig?.platformFeePercent ?? 10)) / 100).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Creator revenue</p>
            <p className="text-xl font-bold">${(totalRevenue - (totalRevenue * (financeConfig?.platformFeePercent ?? 10)) / 100).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Orders</p>
            <p className="text-xl font-bold">{orders._count}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Financial settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/financials" method="POST" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Platform fee (%)</Label>
                <Input name="platformFeePercent" type="number" step="0.1" defaultValue={financeConfig?.platformFeePercent ?? 10} />
              </div>
              <div className="space-y-1">
                <Label>Moderator fee (%)</Label>
                <Input name="moderatorFeePercent" type="number" step="0.1" defaultValue={financeConfig?.moderatorFeePercent ?? 0} />
              </div>
              <div className="space-y-1">
                <Label>Server fee (%)</Label>
                <Input name="serverFeePercent" type="number" step="0.1" defaultValue={financeConfig?.serverFeePercent ?? 0} />
              </div>
              <div className="space-y-1">
                <Label>Tax rate (%)</Label>
                <Input name="taxRatePercent" type="number" step="0.1" defaultValue={financeConfig?.taxRatePercent ?? 0} />
              </div>
              <div className="space-y-1">
                <Label>Minimum payout</Label>
                <Input name="minimumPayout" type="number" step="0.01" defaultValue={financeConfig?.minimumPayout ?? 50} />
              </div>
              <div className="space-y-1">
                <Label>Payout schedule</Label>
                <select name="payoutSchedule" defaultValue={financeConfig?.payoutSchedule ?? "WEEKLY"} className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Payout hold days</Label>
                <Input name="payoutHoldDays" type="number" defaultValue={financeConfig?.payoutHoldDays ?? 7} />
              </div>
              <div className="space-y-1">
                <Label>Refund window (days)</Label>
                <Input name="refundWindowDays" type="number" defaultValue={financeConfig?.refundWindowDays ?? 30} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch name="stripeConnectEnabled" defaultChecked={financeConfig?.stripeConnectEnabled ?? true} />
              <Label>Stripe Connect enabled</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch name="invoiceEnabled" defaultChecked={financeConfig?.invoiceEnabled ?? false} />
              <Label>Enable invoices</Label>
            </div>
            <Button type="submit">Save financial settings</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <PiggyBank className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Recent payouts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No payouts yet.</p>
          ) : (
            <div className="space-y-2">
              {payouts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      ${p.amount.toFixed(2)} · {p.creator?.displayName || p.creator?.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.status} · {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={p.status === "PAID" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}