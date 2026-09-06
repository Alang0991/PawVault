export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Users,
  Crown,
  Package,
  ShoppingCart,
  Download,
  AlertTriangle,
  ScrollText,
  DollarSign,
  Activity,
} from "lucide-react"

function StatCard({ icon: Icon, label, value, href }: any) {
  const content = (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold truncate">{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

export default async function FounderOverviewPage() {
  const [
    totalUsers,
    totalCreators,
    totalVerifiedCreators,
    totalProducts,
    publishedProducts,
    totalOrders,
    paidOrders,
    totalRevenueAgg,
    totalDownloads,
    pendingReports,
    totalReports,
    pendingCreatorApplications,
    recentAuditLogs,
    staffCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: ["CREATOR", "VERIFIED_CREATOR"] } } }),
    prisma.user.count({ where: { isVerified: true, role: { in: ["CREATOR", "VERIFIED_CREATOR"] } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PAID", "COMPLETED"] } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "COMPLETED"] } },
    }),
    prisma.download.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.report.count(),
    prisma.creatorApplication.count({ where: { status: "PENDING" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { username: true, displayName: true, role: true } } },
    }),
    prisma.user.count({ where: { role: { in: ["MODERATOR", "ADMIN", "FOUNDER"] } } }),
  ])

  const totalRevenue = totalRevenueAgg._sum.total ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Founder Dashboard</h1>
        <p className="text-muted-foreground">Real platform overview. No fake data.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={totalUsers} href="/admin/founder/users" />
        <StatCard icon={Crown} label="Active creators" value={totalCreators} href="/admin/founder/creators" />
        <StatCard icon={Package} label="Products" value={publishedProducts} href="/admin/founder/products" />
        <StatCard icon={ShoppingCart} label="Orders" value={totalOrders} href="/admin/founder/orders" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${totalRevenue.toFixed(2)}`} href="/admin/founder/orders" />
        <StatCard icon={Download} label="Downloads" value={totalDownloads} />
        <StatCard icon={AlertTriangle} label="Reports" value={pendingReports} href="/admin/founder/reports" />
        <StatCard icon={ScrollText} label="Staff" value={staffCount} href="/admin/founder/staff" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Latest administrative actions</CardDescription>
              </div>
              <Link href="/admin/founder/audit" className="text-sm underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentAuditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {recentAuditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {log.user?.displayName || log.user?.username || "system"} · {log.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {log.user?.role && (
                      <Badge variant="outline">{log.user.role}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>Items awaiting review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/founder/reports" className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Reports</span>
              <Badge variant={pendingReports > 0 ? "destructive" : "secondary"}>{pendingReports}</Badge>
            </Link>
            <Link href="/admin/founder/creators" className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="flex items-center gap-2"><Crown className="h-4 w-4" /> Creator applications</span>
              <Badge variant={pendingCreatorApplications > 0 ? "destructive" : "secondary"}>{pendingCreatorApplications}</Badge>
            </Link>
            <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-900">
              <span className="flex items-center gap-2"><Package className="h-4 w-4" /> Draft products</span>
              <Badge variant="secondary">{totalProducts - publishedProducts}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-900">
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Verified creators</span>
              <Badge variant="secondary">{totalVerifiedCreators}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5" />
            <div>
              <CardTitle>Platform health</CardTitle>
              <CardDescription>Honest snapshot of activity</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm">
          <div>
            <p className="text-muted-foreground">Paid orders</p>
            <p className="font-semibold">{paidOrders}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total reports (all-time)</p>
            <p className="font-semibold">{totalReports}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Draft products</p>
            <p className="font-semibold">{totalProducts - publishedProducts}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total products</p>
            <p className="font-semibold">{totalProducts}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
