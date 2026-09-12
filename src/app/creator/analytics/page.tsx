"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatPrice, formatDate } from "@/lib/helpers"
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package,
  BarChart3,
  Users,
  MousePointer,
  Monitor,
  Smartphone,
  Globe,
  PieChart,
  Download,
  Star
} from "lucide-react"

interface AnalyticsData {
  range: string
  totalProducts: number
  publishedProducts: number
  totalRevenue: number
  orders: number
  unitsSold: number
  avgOrder: number
  topProducts: Array<{
    productId: string
    title: string
    slug: string
    revenue: number
    quantity: number
    conversionRate: number
  }>
  recentOrders: Array<{
    id: string
    total: number
    status: string
    createdAt: string
    items: Array<{
      product: { title: string; slug: string }
      quantity: number
      price: number
    }>
    buyer: { displayName: string | null; username: string }
  }>
  revenueOverTime: Array<{
    date: string
    revenue: number
    orders: number
    units: number
  }>
  trafficSources: Array<{
    source: string
    visits: number
    percentage: number
  }>
  deviceStats: Array<{
    device: string
    visits: number
    percentage: number
  }>
  topCountries: Array<{
    country: string
    visits: number
    percentage: number
  }>
  productViews: Array<{
    productId: string
    title: string
    slug: string
    views: number
    conversionRate: number
  }>
}

export default function CreatorAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d")

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/creator/analytics?range=${range}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Unable to load analytics data</p>
        <Button onClick={fetchData} className="mt-4">Retry</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-text-secondary">Track your store performance and customer insights</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <Button
              key={r}
              variant={range === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(r)}
            >
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">{formatPrice(data.totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold">{data.orders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Units Sold</p>
              <p className="text-2xl font-bold">{data.unitsSold}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Order</p>
              <p className="text-2xl font-bold">{formatPrice(data.avgOrder)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Over Time */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.revenueOverTime.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No revenue data for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Orders</th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenueOverTime.map((row) => (
                    <tr key={row.date} className="border-b last:border-0">
                      <td className="py-2 px-4">{formatDate(row.date)}</td>
                      <td className="text-right py-2 px-4 font-medium">{formatPrice(row.revenue)}</td>
                      <td className="text-right py-2 px-4">{row.orders}</td>
                      <td className="text-right py-2 px-4">{row.units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Products by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              data.topProducts.map((tp) => (
                <div key={tp.productId} className="flex items-center justify-between">
                  <Link href={`/product/${tp.slug}`} className="text-sm font-medium hover:underline truncate max-w-[200px]">
                    {tp.title}
                  </Link>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(tp.revenue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {tp.quantity} sold · {tp.conversionRate.toFixed(1)}% conversion
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              data.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {o.items[0]?.product.title}
                      {o.items.length > 1 ? ` +${o.items.length - 1}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.buyer?.displayName || o.buyer?.username || "Guest"} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(o.total)}</p>
                    <Badge variant={o.status === "COMPLETED" ? "default" : "secondary"}>
                      {o.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources & Device Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.trafficSources.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Traffic analytics not yet available. Enable analytics tracking to see data.
              </p>
            ) : (
              <div className="space-y-3">
                {data.trafficSources.map((ts) => (
                  <div key={ts.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-sm">{ts.source}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {ts.visits.toLocaleString()} visits
                      </span>
                      <div className="w-32">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${ts.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium w-10 text-right">
                        {ts.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.deviceStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Device analytics not yet available.
              </p>
            ) : (
              <div className="space-y-3">
                {data.deviceStats.map((ds) => (
                  <div key={ds.device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {ds.device === "Desktop" && <Monitor className="h-4 w-4 text-muted-foreground" />}
                        {ds.device === "Mobile" && <Smartphone className="h-4 w-4 text-muted-foreground" />}
                        {ds.device === "Tablet" && <MousePointer className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <span className="font-medium text-sm">{ds.device}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {ds.visits.toLocaleString()}
                      </span>
                      <div className="w-32">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${ds.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium w-10 text-right">
                        {ds.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Countries & Product Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No geographic data available.</p>
            ) : (
              <div className="space-y-3">
                {data.topCountries.map((tc) => (
                  <div key={tc.country} className="flex items-center justify-between">
                    <span className="font-medium text-sm">{tc.country}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{tc.visits.toLocaleString()} visits</span>
                      <span className="font-medium">{tc.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Views & Conversion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Product Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.productViews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No view data available.</p>
            ) : (
              <div className="space-y-3">
                {data.productViews.slice(0, 10).map((pv) => (
                  <div key={pv.productId} className="flex items-center justify-between">
                    <Link href={`/product/${pv.slug}`} className="text-sm font-medium hover:underline truncate max-w-[180px]">
                      {pv.title}
                    </Link>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground w-20 text-right">{pv.views.toLocaleString()} views</span>
                      <span className={`font-medium ${pv.conversionRate > 2 ? "text-green-600" : pv.conversionRate > 0.5 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {pv.conversionRate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        {data.publishedProducts} of {data.totalProducts} products published.
      </div>
    </div>
  )
}