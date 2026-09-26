"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Type, Layout, Globe, Shield } from "lucide-react"

interface AppearanceFormProps {
  config: any
  tab: string
}

export function AppearanceForm({ config, tab }: AppearanceFormProps) {
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const form = e.currentTarget as HTMLFormElement
    const fd = new FormData(form)
    const payload: any = {}
    for (const [k, v] of fd.entries()) {
      if (v === "on") payload[k] = true
      else if (v === "off") payload[k] = false
      else payload[k] = v
    }
    try {
      await fetch("/api/admin/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } finally {
      setSaving(false)
    }
  }

  if (tab === "branding") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <CardTitle className="text-base">Branding</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Brand Name</Label>
              <Input name="brandName" defaultValue={config?.brandName ?? "PawMart"} />
            </div>
            <div className="space-y-1">
              <Label>Logo URL</Label>
              <Input name="logoUrl" defaultValue={config?.logoUrl ?? ""} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label>Favicon URL</Label>
              <Input name="faviconUrl" defaultValue={config?.faviconUrl ?? ""} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Primary</Label>
                <Input name="primaryColor" type="color" defaultValue={config?.primaryColor ?? "#8B5CF6"} />
              </div>
              <div className="space-y-1">
                <Label>Secondary</Label>
                <Input name="secondaryColor" type="color" defaultValue={config?.secondaryColor ?? "#EC4899"} />
              </div>
              <div className="space-y-1">
                <Label>Accent</Label>
                <Input name="accentColor" type="color" defaultValue={config?.accentColor ?? "#F59E0B"} />
              </div>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save branding"}</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (tab === "typography") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <CardTitle className="text-base">Typography</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Font Family</Label>
              <Input name="fontFamily" defaultValue={config?.fontFamily ?? "Inter"} />
            </div>
            <div className="space-y-1">
              <Label>Heading Font Family</Label>
              <Input name="headingFontFamily" defaultValue={config?.headingFontFamily ?? ""} />
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save typography"}</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (tab === "layout") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <CardTitle className="text-base">Layout</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Border Radius</Label>
              <Input name="borderRadius" defaultValue={config?.borderRadius ?? "0.5rem"} />
            </div>
            <div className="space-y-1">
              <Label>Shadow Intensity</Label>
              <Input name="shadowIntensity" defaultValue={config?.shadowIntensity ?? "md"} />
            </div>
            <div className="space-y-1">
              <Label>Density</Label>
              <Input name="density" defaultValue={config?.density ?? "comfortable"} />
            </div>
            <div className="flex items-center gap-2">
              <Switch name="motionEnabled" defaultChecked={config?.motionEnabled ?? true} />
              <Label>Enable motion</Label>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save layout"}</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (tab === "seo") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <CardTitle className="text-base">SEO</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Meta Title</Label>
              <Input name="metaTitle" defaultValue={config?.metaTitle ?? ""} />
            </div>
            <div className="space-y-1">
              <Label>Meta Description</Label>
              <Textarea name="metaDescription" defaultValue={config?.metaDescription ?? ""} />
            </div>
            <div className="space-y-1">
              <Label>OG Image URL</Label>
              <Input name="ogImageUrl" defaultValue={config?.ogImageUrl ?? ""} />
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save SEO"}</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <CardTitle className="text-base">System</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch name="maintenanceMode" defaultChecked={config?.maintenanceMode ?? false} />
            <Label>Maintenance mode</Label>
          </div>
          <div className="space-y-1">
            <Label>Maintenance message</Label>
            <Textarea name="maintenanceMessage" defaultValue={config?.maintenanceMessage ?? ""} />
          </div>
          <div className="flex items-center gap-2">
            <Switch name="analyticsEnabled" defaultChecked={config?.analyticsEnabled ?? true} />
            <Label>Enable analytics</Label>
          </div>
          <div className="space-y-1">
            <Label>Analytics provider</Label>
            <Input name="analyticsProvider" defaultValue={config?.analyticsProvider ?? ""} />
          </div>
          <div className="space-y-1">
            <Label>Analytics ID</Label>
            <Input name="analyticsId" defaultValue={config?.analyticsId ?? ""} />
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save system"}</Button>
        </form>
      </CardContent>
    </Card>
  )
}