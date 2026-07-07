import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function ModerationPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  if (!["ADMIN", "OWNER"].includes(user.role)) {
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
                You do not have permission to access moderation tools. Only administrators and platform owners can view this area.
              </p>
              <Button asChild className="w-full">
                <Link href="/">Return Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const quickLinks = [
    { href: "/moderation/dashboard", label: "Dashboard", desc: "Overview of moderation activity" },
    { href: "/moderation/users", label: "Users", desc: "Manage user accounts and roles" },
    { href: "/moderation/products", label: "Products", desc: "Review and moderate product listings" },
    { href: "/moderation/reports", label: "Reports", desc: "Review flagged content and reports" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Moderation</h1>
            <p className="text-muted-foreground">Platform administration and moderation tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Card key={link.href} className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-lg">{link.label}</CardTitle>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={link.href}>Open {link.label}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
