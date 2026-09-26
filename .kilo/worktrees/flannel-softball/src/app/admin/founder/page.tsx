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
  Shield,
} from "lucide-react"

function StatCard({ icon: Icon, label, value, href }: any) {
  const content = (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="h-11 w-11 rounded-lg bg-foreground flex items-center justify-center">
          <Icon className="h-5 w-5 text-background" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold truncate">{value.toLocaleString()}</p>
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
    suspendedUsers,
    flaggedProducts,
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
    prisma.user.count({ where: { status: { in: ["SUSPENDED", "BANNED"] } } }),
    prisma.product.count({ where: { isPublished: false } }),
  ])

  const totalRevenue = totalRevenueAgg._sum.total ?? 0
  const attentionItems = [
    { label: "Open reports", value: pendingReports, href: "/admin/founder/reports", icon: AlertTriangle },
    { label: "Pending creator applications", value: pendingCreatorApplications, href: "/admin/founder/creators", icon: Crown },
    { label: "Products requiring moderation", value: flaggedProducts, href: "/admin/founder/products", icon: Package },
    { label: "Suspended users", value: suspendedUsers, href: "/admin/founder/users", icon: Users },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Founder Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real platform overview.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Users} label="Users" value={totalUsers} href="/admin/founder/users" />
        <StatCard icon={Crown} label="Creators" value={totalCreators} href="/admin/founder/creators" />
        <StatCard icon={Package} label="Products" value={publishedProducts} href="/admin/founder/products" />
        <StatCard icon={ShoppingCart} label="Orders" value={totalOrders} href="/admin/founder/orders" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${totalRevenue.toFixed(2)}`} href="/admin/founder/orders" />
        <StatCard icon={Download} label="Downloads" value={totalDownloads} />
        <StatCard icon={AlertTriangle} label="Reports" value={pendingReports} href="/admin/founder/reports" />
        <StatCard icon={ScrollText} label="Staff" value={staffCount} href="/admin/founder/staff" />
      </div>

      {attentionItems.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-500" />
              <div>
                <CardTitle>Requires Attention</CardTitle>
                <CardDescription>Items that need your review</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {attentionItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-gray-900 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Badge variant={item.value > 0 ? "destructive" : "secondary"}>{item.value}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Nothing needs your attention.</p>
          </CardContent>
        </Card>
      )}

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
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Honest snapshot of activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paid orders</span>
              <span className="font-semibold">{paidOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total reports (all-time)</span>
              <span className="font-semibold">{totalReports}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Draft products</span>
              <span className="font-semibold">{totalProducts - publishedProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Verified creators</span>
              <span className="font-semibold">{totalVerifiedCreators}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
