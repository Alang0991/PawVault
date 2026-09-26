export const dynamic = "force-dynamic"

import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Users, Shield, Settings, Activity, BarChart3, AlertTriangle } from "lucide-react"

export default async function AdminPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  if (!["ADMIN", "FOUNDER"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
        <div className="container mx-auto px-4 max-w-xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <CardTitle>Access Denied</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You do not have permission to access the admin panel. Only administrators and the platform founder can view this area.
              </p>
              <Button asChild className="w-full">
                <Link href="/moderation">Go to Moderation</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Return Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isFounder = user.role === "FOUNDER"

  const [
    userCount,
    productCount,
    pendingReports,
    staffCount,
  ] = await Promise.all([
    prisma.user.count({ where: { isInternal: false } }).catch(() => 0),
    prisma.product.count({ where: { creator: { isInternal: false } } }).catch(() => 0),
    prisma.report.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.user.count({ where: { role: { in: ["MODERATOR", "ADMIN", "FOUNDER"] }, isInternal: false } }).catch(() => 0),
  ])

  const sections = [
    { href: "/moderation", label: "Moderation Tools", desc: "Reports, products, users", icon: Shield, staffOnly: false },
    { href: "/moderation/users", label: "Users", desc: `${userCount} total`, icon: Users, staffOnly: false },
    { href: "/moderation/products", label: "Products", desc: `${productCount} total`, icon: BarChart3, staffOnly: false },
    { href: "/moderation/reports", label: "Reports", desc: `${pendingReports} pending`, icon: AlertTriangle, staffOnly: false },
    { href: "/admin/founder", label: "Founder Dashboard", desc: "Overview, audit, settings", icon: Activity, staffOnly: false },
  ]

  if (isFounder) {
    sections.push(
      { href: "/admin/founder/staff", label: "Staff / Team", desc: `${staffCount} staff`, icon: Shield, staffOnly: true },
      { href: "/admin/founder/audit", label: "Audit Logs", desc: "Full history", icon: Activity, staffOnly: true },
      { href: "/admin/founder/settings", label: "Settings", desc: "Platform config", icon: Settings, staffOnly: true },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-muted-foreground">
            PawVault platform administration
            {isFounder ? " (Founder)" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Card key={s.href} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{s.label}</CardTitle>
                    <CardDescription>{s.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={s.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
