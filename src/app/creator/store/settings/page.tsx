"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Upload, Loader2, Palette, Megaphone, Hash, Globe, Save } from "lucide-react"

interface Store {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  banner: string | null
  socialLinks: string | null
  primaryColor: string | null
  secondaryColor: string | null
  customCss: string | null
  announcements: string | null
}

interface Announcement {
  id: string
  title: string
  body: string
  isPublished: boolean
  createdAt: string
}

export default function CreatorShopSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<"logo" | "banner" | "">("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [store, setStore] = useState<Store | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", body: "", isPublished: false })
  const [activeTab, setActiveTab] = useState<"general" | "branding" | "announcements">("general")

  const [form, setForm] = useState({ 
    name: "", 
    slug: "", 
    description: "", 
    twitter: "", 
    youtube: "", 
    discord: "",
    primaryColor: "#8b5cf6",
    secondaryColor: "#ec4899",
    customCss: "",
  })

  const load = useCallback(async () => {
    try {
      const [storeRes, announcementsRes] = await Promise.all([
        fetch("/api/creator/store/settings"),
        fetch("/api/creator/store/announcements"),
      ])
      if (storeRes.ok) {
        const data = await storeRes.json()
        const s: Store | null = data.store
        setStore(s)
        if (s) {
          const social = parseSocial(s.socialLinks)
          setForm({
            name: s.name || "",
            slug: s.slug || "",
            description: s.description || "",
            twitter: social.twitter || "",
            youtube: social.youtube || "",
            discord: social.discord || "",
            primaryColor: s.primaryColor || "#8b5cf6",
            secondaryColor: s.secondaryColor || "#ec4899",
            customCss: s.customCss || "",
          })
        }
      }
      if (announcementsRes.ok) {
        const data = await announcementsRes.json()
        setAnnouncements(data.announcements || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function parseSocial(raw: any): Record<string, string> {
    if (!raw) return {}
    try { return typeof raw === "string" ? JSON.parse(raw) : raw } catch { return {} }
  }

  const uploadImage = async (kind: "logo" | "banner", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(kind)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch(`/api/creator/store/${kind}`, { method: "POST", body: fd })
      if (res.ok) {
        const data = await res.json()
        setStore((s) => (s ? { ...s, [kind]: data[kind] } : s))
        setSuccess(`${kind === "logo" ? "Logo" : "Banner"} updated`)
      } else {
        const err = await res.json()
        setError(err.error || "Upload failed")
      }
    } catch {
      setError("Upload failed")
    } finally {
      setUploading("")
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const socialLinks: Record<string, string> = {}
      if (form.twitter) socialLinks.twitter = form.twitter
      if (form.youtube) socialLinks.youtube = form.youtube
      if (form.discord) socialLinks.discord = form.discord
      const res = await fetch("/api/creator/store/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          socialLinks,
          primaryColor: form.primaryColor,
          secondaryColor: form.secondaryColor,
          customCss: form.customCss,
        }),
      })
      if (res.ok) {
        setSuccess("Store settings saved")
        load()
      } else {
        const err = await res.json()
        setError(err.error || "Failed to save")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const saveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/creator/store/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnouncement),
      })
      if (res.ok) {
        setSuccess("Announcement created")
        setShowNewAnnouncement(false)
        setNewAnnouncement({ title: "", body: "", isPublished: false })
        load()
      } else {
        const err = await res.json()
        setError(err.error || "Failed to create announcement")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return
    try {
      const res = await fetch(`/api/creator/store/announcements/${id}`, { method: "DELETE" })
      if (res.ok) {
        setSuccess("Announcement deleted")
        load()
      } else {
        setError("Failed to delete")
      }
    } catch {
      setError("Something went wrong")
    }
  }

  const toggleAnnouncement = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/creator/store/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })
      if (res.ok) {
        load()
      }
    } catch {
      setError("Failed to update")
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-8">Store Settings</h1><p>Loading...</p></div>
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Store Settings</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You don&apos;t have a store yet.</p>
            <Button asChild className="gradient-bg text-white"><Link href="/store/create">Create your store</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Store Settings</h1>
            <p className="text-text-secondary">Manage your storefront appearance, branding, and announcements</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                View Store
              </Link>
            </Button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-600">{success}</p>}

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-8">
          <Button
            variant={activeTab === "general" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("general")}
            className="flex-1"
          >
            General
          </Button>
          <Button
            variant={activeTab === "branding" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("branding")}
            className="flex-1"
          >
            <Palette className="mr-2 h-4 w-4" />
            Branding
          </Button>
          <Button
            variant={activeTab === "announcements" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("announcements")}
            className="flex-1"
          >
            <Megaphone className="mr-2 h-4 w-4" />
            Announcements
          </Button>
        </div>

        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg overflow-hidden bg-muted aspect-[21/9] flex items-center justify-center relative">
                  {store.banner ? (
                    <Image src={store.banner} alt="banner" fill className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-sm">No banner</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {store.logo ? <Image src={store.logo} alt="logo" width={64} height={64} className="w-full h-full object-cover" /> : <span className="text-muted-foreground text-xs">No logo</span>}
                  </div>
                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                        {uploading === "logo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Logo
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage("logo", e)} />
                    </label>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                        {uploading === "banner" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Banner
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage("banner", e)} />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>General</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={save} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Store Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Store Slug (URL)</Label>
                    <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                    <p className="text-xs text-muted-foreground">Your store will be at /store/{form.slug || "your-slug"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Social Links</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input placeholder="Twitter" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
                      <Input placeholder="YouTube" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} />
                      <Input placeholder="Discord" value={form.discord} onChange={(e) => setForm({ ...form, discord: e.target.value })} />
                    </div>
                  </div>
                  <Button type="submit" disabled={saving} className="gradient-bg text-white">
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Custom Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        id="primaryColor"
                        value={form.primaryColor}
                        onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded border cursor-pointer"
                      />
                      <Input
                        value={form.primaryColor}
                        onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                        placeholder="#8b5cf6"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Used for buttons, links, and accents</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={form.secondaryColor}
                        onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                        className="w-12 h-12 rounded border cursor-pointer"
                      />
                      <Input
                        value={form.secondaryColor}
                        onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                        placeholder="#ec4899"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Used for gradients and hover states</p>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="p-4 bg-muted rounded-lg border">
                  <p className="text-sm font-medium mb-4">Live Preview</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button 
                      className="gradient-bg text-white"
                      style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }}
                    >
                      Primary Action
                    </Button>
                    <Button variant="outline" style={{ borderColor: form.primaryColor, color: form.primaryColor }}>
                      Secondary Action
                    </Button>
                    <a href="#" style={{ color: form.primaryColor }}>Link Color</a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Custom CSS (Advanced)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add custom CSS to further customize your storefront. 
                  <strong>Warning:</strong> Invalid CSS may break your store layout. Keep changes within PawVault design limits.
                </p>
                <Textarea
                  id="customCss"
                  rows={10}
                  value={form.customCss}
                  onChange={(e) => setForm({ ...form, customCss: e.target.value })}
                  placeholder="/* Example: .store-header { border-radius: 20px; } */"
                  className="font-mono text-sm"
                />
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Custom CSS is sanitized. Only storefront-specific selectors are allowed. 
                    Global styles, animations, and layout-breaking rules will be stripped.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Store Announcements
                  </CardTitle>
                  <Button onClick={() => setShowNewAnnouncement(true)}>
                    <Save className="mr-2 h-4 w-4" />
                    New Announcement
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No announcements yet.</p>
                    <Button onClick={() => setShowNewAnnouncement(true)}>
                      Create your first announcement
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border-b last:border-0 py-4 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{announcement.title}</h4>
                            <Badge variant={announcement.isPublished ? "default" : "secondary"} className="text-xs">
                              {announcement.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary line-clamp-2">{announcement.body}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created {new Date(announcement.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAnnouncement(announcement.id, announcement.isPublished)}
                          >
                            {announcement.isPublished ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteAnnouncement(announcement.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {showNewAnnouncement && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Announcement</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={saveAnnouncement} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="announcementTitle">Title</Label>
                      <Input
                        id="announcementTitle"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        placeholder="New update available!"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="announcementBody">Content</Label>
                      <Textarea
                        id="announcementBody"
                        rows={4}
                        value={newAnnouncement.body}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
                        placeholder="We've just released version 2.0 with exciting new features..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAnnouncement.isPublished}
                          onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPublished: e.target.checked })}
                          className="rounded"
                        />
                        Publish immediately
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving} className="gradient-bg text-white">
                        {saving ? "Creating..." : "Create Announcement"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowNewAnnouncement(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}