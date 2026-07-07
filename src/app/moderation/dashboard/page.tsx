import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Users, Package, AlertTriangle, TrendingUp } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ModerationDashboardPage() {
  const user = await getServerUser()
  if (!user || !["ADMIN", "OWNER"].includes(user.role)) {
    redirect("/moderation")
  }

  let stats
  try {
    const [userCount, productCount, reportCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.order.count(),
    ])
    stats = { userCount, productCount, reportCount, orderCount }
  } catch (error) {
    console.error("Moderation dashboard error:", error)
    stats = { userCount: 0, productCount: 0, reportCount: 0, orderCount: 0 }
  }

  const quickLinks = [
    { href: "/moderation/users", label: "Users", icon: Users, count: stats.userCount },
    { href: "/moderation/products", label: "Products", icon: Package, count: stats.productCount },
    { href: "/moderation/reports", label: "Pending Reports", icon: AlertTriangle, count: stats.reportCount },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and quick actions</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.userCount.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stats.productCount.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Reports</p>
                <p className="text-2xl font-bold">{stats.reportCount.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.orderCount.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {quickLinks.map((link) => (
            <Card key={link.href} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
                    <link.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{link.label}</CardTitle>
                    <p className="text-sm text-muted-foreground">{link.count.toLocaleString()} total</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={link.href}>Manage {link.label}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
