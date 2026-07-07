"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Upload, Loader2 } from "lucide-react"

interface Store {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  banner: string | null
  socialLinks: string | null
}

export default function CreatorShopSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<"logo" | "banner" | "">("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [store, setStore] = useState<Store | null>(null)
  const [form, setForm] = useState({ name: "", slug: "", description: "", twitter: "", youtube: "", discord: "" })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const res = await fetch("/api/creator/store/settings")
      if (res.ok) {
        const data = await res.json()
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
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }

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
        }),
      })
      if (res.ok) {
        setSuccess("Store settings saved")
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Store Settings</h1>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-600">{success}</p>}

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted aspect-[21/9] flex items-center justify-center">
                {store.banner ? (
                  <img src={store.banner} alt="banner" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-sm">No banner</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {store.logo ? <img src={store.logo} alt="logo" className="w-full h-full object-cover" /> : <span className="text-muted-foreground text-xs">No logo</span>}
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
      </div>
    </div>
  )
}
