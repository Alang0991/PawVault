import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Type, Layout, Globe, Shield, Eye, Image, MousePointer } from "lucide-react"
import Link from "next/link"
import { AppearanceForm } from "@/components/appearance-form"

export const dynamic = "force-dynamic"

export default async function FounderAppearancePage() {
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
    console.error("Failed to fetch appearance config:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Global colours, fonts, themes and branding. No code edits required.
        </p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="branding"><Palette className="h-4 w-4 mr-2" />Branding</TabsTrigger>
          <TabsTrigger value="typography"><Type className="h-4 w-4 mr-2" />Typography</TabsTrigger>
          <TabsTrigger value="layout"><Layout className="h-4 w-4 mr-2" />Layout</TabsTrigger>
          <TabsTrigger value="seo"><Globe className="h-4 w-4 mr-2" />SEO</TabsTrigger>
          <TabsTrigger value="system"><Shield className="h-4 w-4 mr-2" />System</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <AppearanceForm config={config} tab="branding" />
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <AppearanceForm config={config} tab="typography" />
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <AppearanceForm config={config} tab="layout" />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <AppearanceForm config={config} tab="seo" />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <AppearanceForm config={config} tab="system" />
        </TabsContent>
      </Tabs>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}