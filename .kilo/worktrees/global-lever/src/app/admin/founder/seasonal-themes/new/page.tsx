"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { getAllSeasonalThemes } from "@/lib/seasonal-themes"
import type { SeasonalEffectConfig } from "@/lib/seasonal-themes"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"

const ALL_EFFECTS: SeasonalEffectConfig[] = [
  { id: "snow", name: "Snow", description: "Gentle snowfall", density: "light", color: "#FFFFFF" },
  { id: "fallingLeaves", name: "Falling Leaves", description: "Autumn leaves", density: "medium", color: "#D97706" },
  { id: "fireflies", name: "Fireflies", description: "Floating fireflies", density: "light", color: "#10B981" },
  { id: "confetti", name: "Confetti", description: "Floating confetti", density: "medium", color: "#EC4899" },
  { id: "christmasLights", name: "Christmas Lights", description: "Twinkling lights", density: "medium", color: "#FF0000" },
  { id: "floatingParticles", name: "Floating Particles", description: "Floating particles", density: "light", color: "#93C5FD" },
]

export default function NewSeasonalThemePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isEnabled: false,
    startDate: "",
    endDate: "",
    effects: [] as SeasonalEffectConfig[],
    primaryColor: "#8B5CF6",
    secondaryColor: "#0EA5E9",
    accentColor: "#8B5CF6",
    backgroundColor: "#0F172A",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const config: Record<string, unknown> = {
      effects: formData.effects,
      colors: {
        primary: formData.primaryColor,
        secondary: formData.secondaryColor,
        accent: formData.accentColor,
        background: formData.backgroundColor,
      },
    }

    try {
      const res = await fetch("/api/seasonal-themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          isEnabled: formData.isEnabled,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          config,
          displayOrder: 0,
        }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => {
          router.push("/admin/founder/seasonal-themes")
        }, 1000)
      }
    } catch (error) {
      console.error("Failed to create theme:", error)
    } finally {
      setSaving(false)
    }
  }

  const toggleEffect = (effect: SeasonalEffectConfig) => {
    const exists = formData.effects.some((e) => e.id === effect.id)
    if (exists) {
      setFormData({
        ...formData,
        effects: formData.effects.filter((e) => e.id !== effect.id),
      })
    } else {
      setFormData({
        ...formData,
        effects: [...formData.effects, effect],
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Seasonal Theme</h1>
        <p className="text-sm text-muted-foreground">
          Create a custom seasonal theme with effects and scheduling
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                placeholder="e.g., summer-festival"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enabled</Label>
              <Switch
                checked={formData.isEnabled}
                onCheckedChange={(e) => setFormData({ ...formData, isEnabled: e })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Effects</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select visual effects for this theme
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_EFFECTS.map((effect) => (
                <label
                  key={effect.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.effects.some((e) => e.id === effect.id)
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent/10"
                  }`}
                >
                  <Switch
                    checked={formData.effects.some((e) => e.id === effect.id)}
                    onCheckedChange={() => toggleEffect(effect)}
                  />
                  <div>
                    <p className="font-medium">{effect.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {effect.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Primary</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-8 p-0 border rounded cursor-pointer"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <Label>Secondary</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-10 h-8 p-0 border rounded cursor-pointer"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <Label>Accent</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-10 h-8 p-0 border rounded cursor-pointer"
                />
                <Input
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <Label>Background</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="w-10 h-8 p-0 border rounded cursor-pointer"
                />
                <Input
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Theme created!</span>}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Theme"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/founder/seasonal-themes">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
