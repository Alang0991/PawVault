"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Shield, Eye, EyeOff, User, Globe, Lock, Database, MapPin, Mail, FileText, List } from "lucide-react"

interface PrivacySettings {
  profileVisibility: "public" | "followers" | "private"
  showEmail: boolean
  showLocation: boolean
  showWebsite: boolean
  showBio: boolean
  showPurchases: boolean
  showReviews: boolean
  showWishlist: boolean
  allowDataCollection: boolean
  allowPersonalization: boolean
  allowMarketing: boolean
}

export function PrivacySettingsSection() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/account/privacy")
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
      } else {
        setSettings(getDefaultSettings())
      }
    } catch {
      setSettings(getDefaultSettings())
    }
  }

  const getDefaultSettings = (): PrivacySettings => ({
    profileVisibility: "public",
    showEmail: false,
    showLocation: true,
    showWebsite: true,
    showBio: true,
    showPurchases: false,
    showReviews: true,
    showWishlist: false,
    allowDataCollection: true,
    allowPersonalization: true,
    allowMarketing: false,
  })

  const handleToggle = (key: keyof PrivacySettings, value: boolean | string) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null))
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/account/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Privacy Settings</h2>
          <p className="text-sm text-text-secondary mt-1">
            Control who can see your information and how your data is used
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {saved && <span className="text-sm text-green-600">Saved!</span>}
        <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Profile Visibility</CardTitle>
                <CardDescription>
                  Who can see your profile page and public information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: "public", label: "Public", desc: "Anyone can view your profile", icon: Globe },
                { value: "followers", label: "Followers Only", desc: "Only people who follow you", icon: User },
                { value: "private", label: "Private", desc: "Only you can view your profile", icon: Lock },
              ].map((opt) => (
                <Label
                  key={opt.value}
                  className={`relative cursor-pointer p-4 border-2 rounded-lg transition-all ${
                    settings.profileVisibility === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="profile-visibility"
                    value={opt.value}
                    checked={settings.profileVisibility === opt.value}
                    onChange={() => handleToggle("profileVisibility", opt.value as any)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <opt.icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-sm text-text-muted">{opt.desc}</p>
                    </div>
                  </div>
                </Label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription>
                  Choose which profile fields are visible to others
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "showEmail", label: "Email Address", desc: "Show your email on your profile", icon: Mail },
              { key: "showLocation", label: "Location", desc: "Show your location", icon: MapPin },
              { key: "showWebsite", label: "Website", desc: "Show your website link", icon: Globe },
              { key: "showBio", label: "Bio", desc: "Show your bio/description", icon: FileText },
            ].map((field) => (
              <div key={field.key} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <field.icon className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="font-medium">{field.label}</p>
                    <p className="text-sm text-text-muted">{field.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[field.key as keyof PrivacySettings] as boolean}
                  onCheckedChange={(checked) => handleToggle(field.key as keyof PrivacySettings, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Activity Visibility</CardTitle>
                <CardDescription>
                  Control who can see your activity on the platform
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "showPurchases", label: "Purchase History", desc: "Show products you've purchased" },
              { key: "showReviews", label: "Reviews", desc: "Show reviews you've written" },
              { key: "showWishlist", label: "Wishlist", desc: "Show your public wishlist" },
            ].map((field) => (
              <div key={field.key} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <List className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="font-medium">{field.label}</p>
                    <p className="text-sm text-text-muted">{field.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[field.key as keyof PrivacySettings] as boolean}
                  onCheckedChange={(checked) => handleToggle(field.key as keyof PrivacySettings, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-amber-500/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Data & Personalization</CardTitle>
                <CardDescription>
                  How your data is used for platform improvements and personalization
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "allowDataCollection", label: "Analytics & Usage Data", desc: "Allow anonymous usage data collection for platform improvements" },
              { key: "allowPersonalization", label: "Personalized Recommendations", desc: "Use your activity to personalize product recommendations" },
              { key: "allowMarketing", label: "Marketing Communications", desc: "Receive marketing emails about new features and promotions" },
            ].map((field) => (
              <div key={field.key} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="font-medium">{field.label}</p>
                    <p className="text-sm text-text-muted">{field.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[field.key as keyof PrivacySettings] as boolean}
                  onCheckedChange={(checked) => handleToggle(field.key as keyof PrivacySettings, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}