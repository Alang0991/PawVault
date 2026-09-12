import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { DollarSign, RefreshCw, Globe } from "lucide-react"
import { SUPPORTED_CURRENCIES, BASE_CURRENCY } from "@/lib/currency"

export const dynamic = "force-dynamic"

export default async function FounderCurrenciesPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let rates: any[] = []
  try {
    rates = await prisma.currencyRate.findMany({
      orderBy: { code: "asc" },
    })
  } catch (error) {
    console.error("Failed to fetch currency rates:", error)
  }

  const rateMap = Object.fromEntries(rates.map((r) => [r.code, r]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Currencies</h1>
        <p className="text-sm text-muted-foreground">
          Manage exchange rates, enable/disable currencies, and regional formatting.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <CardTitle className="text-base">Exchange rates</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Base currency: <b>{BASE_CURRENCY}</b>. Rates are relative to base.
          </p>
          <div className="space-y-3">
            {SUPPORTED_CURRENCIES.map((c) => {
              const rate = rateMap[c.code]
              return (
                <div key={c.code} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      {c.code} <span className="text-muted-foreground">{c.symbol}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{c.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <form action="/api/currency" method="POST" className="flex items-center gap-2">
                      <input type="hidden" name="code" value={c.code} />
                      <input type="hidden" name="rateToBase" value={rate?.rateToBase ?? 1} />
                      <Input
                        name="rateToBase"
                        type="number"
                        step="0.0001"
                        defaultValue={rate?.rateToBase ?? 1}
                        className="w-28 h-8 text-sm"
                      />
                      <Button type="submit" size="sm" variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />Update
                      </Button>
                    </form>
                    <form action="/api/currency" method="POST" className="flex items-center gap-2">
                      <input type="hidden" name="code" value={c.code} />
                      <input type="hidden" name="rateToBase" value={rate?.rateToBase ?? 1} />
                      <input type="hidden" name="isEnabled" value={rate?.isEnabled !== false ? "false" : "true"} />
                      <Button
                        type="submit"
                        size="sm"
                        variant={rate?.isEnabled !== false ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {rate?.isEnabled !== false ? "Disable" : "Enable"}
                      </Button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <CardTitle className="text-base">Regional formatting</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Decimal digits and symbols are configured per currency.</p>
          <p>• Display currency is per-user; payment currency is fixed at checkout.</p>
          <p>• Exchange rates update automatically when enabled.</p>
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}