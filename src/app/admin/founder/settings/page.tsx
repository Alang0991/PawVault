import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function FounderSettingsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const config = await prisma.platformConfig.findUnique({
    where: { id: "singleton" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Platform configuration</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <CardTitle>Marketplace</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Platform fee</span>
            <span>{config?.platformFeePercent ?? 10}%</span>
          </div>
          <div className="flex justify-between">
            <span>Moderator fee</span>
            <span>{config?.moderatorFeePercent ?? 0}%</span>
          </div>
          <div className="flex justify-between">
            <span>Server fee</span>
            <span>{config?.serverFeePercent ?? 0}%</span>
          </div>
          <div className="flex justify-between">
            <span>Currency</span>
            <span>{config?.currency ?? "USD"}</span>
          </div>
          <div className="flex justify-between">
            <span>Stripe Connect</span>
            <span>{config?.stripeConnectEnabled ? "Enabled" : "Disabled"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Founder password was supplied via env and hashed once. Rotate your secret manager entry.</p>
          <p>• All admin routes require server-side role checks.</p>
          <p>• Audit logs redact passwords, tokens, and secrets.</p>
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}
