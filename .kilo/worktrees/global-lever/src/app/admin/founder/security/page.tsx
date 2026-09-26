import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Key, Globe, Bell, Database } from "lucide-react"
import Link from "next/link"
import { SecurityForm } from "@/components/security-form"

export const dynamic = "force-dynamic"

export default async function FounderSecurityPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let config: any = null
  try {
    config = await prisma.appearanceConfig.findUnique({
      where: { id: "singleton" },
    })
  } catch (error) {
    console.error("Failed to fetch security config:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-sm text-muted-foreground">
          Security settings, login monitoring, and system controls.
        </p>
      </div>

      <Tabs defaultValue="login" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="login"><Shield className="h-4 w-4 mr-2" />Login</TabsTrigger>
          <TabsTrigger value="sessions"><Key className="h-4 w-4 mr-2" />Sessions</TabsTrigger>
          <TabsTrigger value="system"><Database className="h-4 w-4 mr-2" />System</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />Alerts</TabsTrigger>
          <TabsTrigger value="backup"><Globe className="h-4 w-4 mr-2" />Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-6">
          <SecurityForm config={config} tab="security-login" />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <SecurityForm config={config} tab="security-sessions" />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SecurityForm config={config} tab="security-system" />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <SecurityForm config={config} tab="security-alerts" />
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <SecurityForm config={config} tab="security-backup" />
        </TabsContent>
      </Tabs>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}