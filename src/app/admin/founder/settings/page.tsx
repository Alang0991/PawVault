import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
        <CardContent>
          <form action="/api/admin/settings" method="POST" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Platform fee (%)</label>
                <Input name="platformFeePercent" type="number" step="0.1" defaultValue={config?.platformFeePercent ?? 10} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Moderator fee (%)</label>
                <Input name="moderatorFeePercent" type="number" step="0.1" defaultValue={config?.moderatorFeePercent ?? 0} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Server fee (%)</label>
                <Input name="serverFeePercent" type="number" step="0.1" defaultValue={config?.serverFeePercent ?? 0} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Currency</label>
                <Input name="currency" defaultValue={config?.currency ?? "USD"} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stripe Connect</label>
                <select name="stripeConnectEnabled" defaultValue={config?.stripeConnectEnabled ? "true" : "false"} className="w-full border rounded-md px-3 py-2 bg-background">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
            <Button type="submit">Save settings</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• All admin routes require server-side role checks.</p>
          <p>• Audit logs redact passwords, tokens, and secrets.</p>
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}
