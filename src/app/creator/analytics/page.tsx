import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatPrice } from "@/lib/helpers"
import { TrendingUp, DollarSign, ShoppingBag, Package } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreatorAnalyticsPage() {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN", "OWNER"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const [
    totalProducts,
    publishedProducts,
    orders,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count({ where: { creatorId: user.id } }),
    prisma.product.count({ where: { creatorId: user.id, isPublished: true } }),
    prisma.order.findMany({
      where: { items: { some: { product: { creatorId: user.id } } } },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { title: true, slug: true } } } },
        buyer: { select: { displayName: true, username: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { product: { creatorId: user.id }, order: { status: "COMPLETED" } },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { price: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      where: { items: { some: { product: { creatorId: user.id } } } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        items: { include: { product: { select: { title: true, slug: true } } } },
        buyer: { select: { displayName: true, username: true } },
      },
    }),
  ])

  const completed = orders.filter((o) => o.status === "COMPLETED")
  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0)
  const unitsSold = completed.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0,
  )
  const avgOrder = completed.length > 0 ? totalRevenue / completed.length : 0

  const productTitles = await prisma.product.findMany({
    where: { id: { in: topProducts.map((t) => t.productId) } },
    select: { id: true, title: true, slug: true },
  })
  const titleMap = new Map(productTitles.map((p) => [p.id, p]))

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
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
              <p className="text-2xl font-bold">{orders.length}</p>
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
              <p className="text-2xl font-bold">{unitsSold}</p>
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
              <p className="text-2xl font-bold">{formatPrice(avgOrder)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              topProducts.map((tp) => {
                const p = titleMap.get(tp.productId)
                return (
                  <div key={tp.productId} className="flex items-center justify-between">
                    <Link href={p ? `/product/${p.slug}` : "#"} className="text-sm font-medium hover:underline truncate">
                      {p?.title || "Product"}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(tp._sum.price || 0)} · {tp._sum.quantity || 0} sold
                    </span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {o.items[0]?.product.title}
                      {o.items.length > 1 ? ` +${o.items.length - 1}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.buyer?.displayName || o.buyer?.username || "Guest"}
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

      <div className="mt-6 text-sm text-muted-foreground">
        {publishedProducts} of {totalProducts} products published.
      </div>
    </div>
  )
}
