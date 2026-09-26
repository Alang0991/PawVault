"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Shield, ShoppingBag, MessageSquare, Star, DollarSign, Users, Megaphone, Mail, AlertTriangle, Tag, Sparkles } from "lucide-react"

interface EmailPreferences {
  security: boolean
  account: boolean
  orders: boolean
  refunds: boolean
  support: boolean
  moderation: boolean
  productUpdates: boolean
  followedCreators: boolean
  marketing: boolean
  wishlistSale: boolean
  wishlistPriceChange: boolean
  wishlistAvailable: boolean
  creatorAnnouncements: boolean
  newProductFollowed: boolean
  reviewNotifications: boolean
  paymentNotifications: boolean
  payoutNotifications: boolean
  securityNotifications: boolean
  systemAnnouncements: boolean
  creatorApproval: boolean
}

export function NotificationPreferencesForm() {
  const [prefs, setPrefs] = useState<EmailPreferences | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadPrefs()
  }, [])

  const loadPrefs = async () => {
    try {
      const res = await fetch("/api/account/preferences")
      if (res.ok) {
        const data = await res.json()
        setPrefs(data.preferences)
      }
    } catch {
      // error
    }
  }

  const handleToggle = (key: keyof EmailPreferences, value: boolean) => {
    setPrefs((prev) => (prev ? { ...prev, [key]: value } : null))
  }

  const handleSave = async () => {
    if (!prefs) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/account/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
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

  if (!prefs) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const sections = [
    {
      title: "Security & Account",
      description: "Critical notifications about your account security",
      icon: Shield,
      items: [
        { key: "security", label: "Security alerts", description: "Login attempts, password changes, MFA" },
        { key: "account", label: "Account changes", description: "Email, username, profile updates" },
        { key: "securityNotifications", label: "Security notifications", description: "Suspicious activity, new devices" },
      ],
    },
    {
      title: "Orders & Payments",
      description: "Updates about your purchases and payments",
      icon: ShoppingBag,
      items: [
        { key: "orders", label: "Order confirmations", description: "Purchase receipts and order updates" },
        { key: "refunds", label: "Refund updates", description: "Refund requests and status changes" },
        { key: "paymentNotifications", label: "Payment notifications", description: "Successful and failed payments" },
        { key: "payoutNotifications", label: "Payout notifications", description: "Creator payouts and earnings" },
      ],
    },
    {
      title: "Products & Creators",
      description: "Updates about products and creators you follow",
      icon: Star,
      items: [
        { key: "productUpdates", label: "Product updates", description: "New versions, changelogs for owned products" },
        { key: "followedCreators", label: "Followed creators", description: "New products and announcements" },
        { key: "newProductFollowed", label: "New products from followed", description: "When creators you follow release products" },
        { key: "creatorAnnouncements", label: "Creator announcements", description: "Posts and updates from creators you follow" },
        { key: "wishlistSale", label: "Wishlist on sale", description: "When wishlist items go on sale" },
        { key: "wishlistPriceChange", label: "Wishlist price changes", description: "Price drops or increases" },
        { key: "wishlistAvailable", label: "Wishlist availability", description: "When items become available/unavailable" },
      ],
    },
    {
      title: "Reviews & Support",
      description: "Community and support notifications",
      icon: MessageSquare,
      items: [
        { key: "reviewNotifications", label: "Review notifications", description: "New reviews, creator responses" },
        { key: "support", label: "Support tickets", description: "Ticket updates and replies" },
        { key: "moderation", label: "Moderation", description: "Content moderation decisions" },
      ],
    },
    {
      title: "Marketing & Announcements",
      description: "Optional promotional and platform updates",
      icon: Megaphone,
      items: [
        { key: "marketing", label: "Marketing emails", description: "Sales, promotions, and recommendations" },
        { key: "systemAnnouncements", label: "System announcements", description: "Platform updates, maintenance, new features" },
        { key: "creatorApproval", label: "Creator approval", description: "Application status updates (for creators)" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Preferences</h2>
          <p className="text-sm text-text-secondary mt-1">
            Choose which notifications you want to receive via email. In-app notifications are always enabled.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Saved!</span>}
          <Button onClick={handleSave} disabled={saving} className="gradient-bg text-white">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Label htmlFor={item.key} className="cursor-pointer flex-1">
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <p className="text-xs text-text-muted">{item.description}</p>
                    </Label>
                  </div>
                  <Switch
                    id={item.key}
                    checked={prefs[item.key as keyof EmailPreferences]}
                    onCheckedChange={(checked) => handleToggle(item.key as keyof EmailPreferences, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}