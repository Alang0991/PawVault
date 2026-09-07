"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  FileText,
  Trash2,
  Star,
  Loader2,
  Check,
  CloudOff,
  Video,
} from "lucide-react"

interface Category { id: string; name: string }
interface MediaItem { id: string; url: string; type: string; isThumbnail: boolean; order: number }
interface FileItem { id: string; filename: string; url: string; size: number; version?: string; platform?: string }
interface ProductTag { tag: { id: string; name: string } }

type SaveStatus = "idle" | "saving" | "saved" | "error"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = params.id
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [newTag, setNewTag] = useState("")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [published, setPublished] = useState(false)

  const [form, setForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    categoryId: "",
    tags: [] as string[],
    price: "",
    salePrice: "",
    isFree: false,
    isOnSale: false,
    contentRating: "SFW" as "SFW" | "MATURE" | "NSFW",
  })

  const dirtyRef = useRef(false)
  const formRef = useRef(form)
  formRef.current = form

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/creator/products/${id}`),
          fetch("/api/categories"),
        ])
        if (catRes.ok) {
          const c = await catRes.json()
          setCategories(c.categories || [])
        }
        if (!prodRes.ok) {
          const err = await prodRes.json().catch(() => ({}))
          setLoadError(err.error || "Product not found or access denied.")
          setLoading(false)
          return
        }
        const { product } = await prodRes.json()
        setMedia(product.media || [])
        setFiles(product.files || [])
        setPublished(!!product.isPublished)
        setForm({
          title: product.title || "",
          slug: product.slug || "",
          subtitle: product.subtitle || "",
          description: product.description || "",
          categoryId: product.categoryId || "",
          tags: (product.tags || []).map((t: ProductTag) => t.tag.name),
          price: product.price ? String(product.price) : "",
          salePrice: product.salePrice ? String(product.salePrice) : "",
          isFree: product.isFree || false,
          isOnSale: product.isOnSale || false,
          contentRating: (product.contentRating as "SFW" | "MATURE" | "NSFW") || "SFW",
        })
      } catch {
        setLoadError("We couldn't load this product. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function autosave() {
    if (!dirtyRef.current) return
    dirtyRef.current = false
    setStatus("saving")
    setError(null)
    try {
      const f = formRef.current
      const res = await fetch(`/api/creator/products/${id}/autosave`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.title,
          slug: f.slug || undefined,
          subtitle: f.subtitle || null,
          description: f.description || null,
          categoryId: f.categoryId || null,
          tags: f.tags,
          price: f.isFree ? 0 : Number(f.price) || 0,
          salePrice: f.salePrice ? Number(f.salePrice) : null,
          isFree: f.isFree,
          isOnSale: f.isOnSale,
          isPublished: published,
          contentRating: f.contentRating,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setStatus("error")
        setError(err.error || "We couldn't save your changes.")
        return
      }
      setStatus("saved")
      setSavedAt(new Date())
    } catch {
      setStatus("error")
      setError("Network error. Your changes are safe — we'll retry.")
    }
  }

  useEffect(() => {
    if (loading) return
    dirtyRef.current = true
    const t = setTimeout(autosave, 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, published, loading])

  useEffect(() => {
    function onUnload(e: BeforeUnloadEvent) {
      if (status === "saving" || dirtyRef.current) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", onUnload)
    return () => window.removeEventListener("beforeunload", onUnload)
  }, [status])

  async function uploadMedia(fileList: FileList | null) {
    if (!fileList) return
    for (const f of Array.from(fileList)) {
      const localUrl = URL.createObjectURL(f)
      const temp: MediaItem = {
        id: `local-${Date.now()}-${Math.random()}`,
        url: localUrl,
        type: f.type.startsWith("video") ? "video" : "image",
        isThumbnail: media.length === 0,
        order: media.length,
      }
      setMedia((prev) => [...prev, temp])
      const fd = new FormData()
      fd.append("file", f)
      fd.append("productId", id)
      fd.append("isThumbnail", media.length === 0 ? "true" : "false")
      fd.append("order", String(media.length))
      const r = await fetch("/api/products/media", { method: "POST", body: fd })
      if (r.ok) {
        const { media: saved } = await r.json()
        setMedia((prev) => prev.map((m) => (m.id === temp.id ? { ...saved } : m)))
      } else {
        setMedia((prev) => prev.filter((m) => m.id !== temp.id))
      }
    }
  }

  async function uploadFile(fileList: FileList | null) {
    if (!fileList) return
    for (const f of Array.from(fileList)) {
      const temp: FileItem = {
        id: `local-${Date.now()}-${Math.random()}`,
        filename: f.name,
        url: "",
        size: f.size,
      }
      setFiles((prev) => [...prev, temp])
      const fd = new FormData()
      fd.append("file", f)
      fd.append("productId", id)
      const r = await fetch("/api/products/files", { method: "POST", body: fd })
      if (r.ok) {
        const { file: saved } = await r.json()
        setFiles((prev) => prev.map((x) => (x.id === temp.id ? saved : x)))
      } else {
        setFiles((prev) => prev.filter((x) => x.id !== temp.id))
      }
    }
  }

  async function deleteMedia(mid: string) {
    const r = await fetch(`/api/products/media/${mid}`, { method: "DELETE" })
    if (r.ok) setMedia((prev) => prev.filter((m) => m.id !== mid))
  }

  async function setThumb(mid: string) {
    setMedia((prev) => prev.map((m) => ({ ...m, isThumbnail: m.id === mid })))
    await fetch(`/api/creator/products/${id}/media/${mid}/thumbnail`, { method: "POST" })
  }

  async function deleteFile(fid: string) {
    const r = await fetch(`/api/products/files/${fid}`, { method: "DELETE" })
    if (r.ok) setFiles((prev) => prev.filter((f) => f.id !== fid))
  }

  const removeTag = (t: string) => setForm({ ...form, tags: form.tags.filter((x) => x !== t) })
  const addTag = (val: string) => {
    const clean = val.trim().replace(/,$/, "").toLowerCase()
    if (clean && !form.tags.includes(clean)) setForm({ ...form, tags: [...form.tags, clean] })
    setNewTag("")
  }

  async function del() {
    if (!confirm("Delete this product permanently? This cannot be undone.")) return
    const res = await fetch(`/api/creator/products/${id}`, { method: "DELETE" })
    if (res.ok) router.push("/creator/products")
    else setError("We couldn't delete this product. Please try again.")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading product...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600 mb-4">{loadError}</p>
            <Button asChild variant="outline">
              <Link href="/creator/products">Back to products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/creator/products"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit product</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={published ? "default" : "secondary"}>
                  {published ? "Published" : "Draft"}
                </Badge>
                <span className="text-sm text-muted-foreground">{form.title || "Untitled"}</span>
              </div>
            </div>
          </div>
          <SaveIndicator status={status} savedAt={savedAt} error={error} />
        </div>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="files">Quick files</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/creator/products/${id}/files`}>
                <FileText className="h-4 w-4 mr-2" /> Open full Files &amp; Content manager
              </Link>
            </Button>
          </div>

          <TabsContent value="details" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product details</CardTitle>
                <CardDescription>Changes save automatically.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>URL slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="flex items-center gap-1">
                        {t}
                        <button type="button" onClick={() => removeTag(t)}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      placeholder="Add tag"
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(newTag) }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => addTag(newTag)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.price}
                      disabled={form.isFree}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sale price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.salePrice}
                      onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={form.isFree} onCheckedChange={(c) => setForm({ ...form, isFree: c })} /> Free
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={form.isOnSale} onCheckedChange={(c) => setForm({ ...form, isOnSale: c })} /> On sale
                  </label>
                </div>

                <ContentRatingPicker
                  value={form.contentRating}
                  onChange={(v) => setForm({ ...form, contentRating: v })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Manage images and videos. The first image is the thumbnail by default.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer block hover:border-primary">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add images or videos</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => uploadMedia(e.target.files)}
                  />
                </label>
                {media.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No media yet.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {media.map((m) => (
                      <div
                        key={m.id}
                        className={`relative rounded-lg overflow-hidden border-2 ${m.isThumbnail ? "border-purple-500" : "border-transparent"}`}
                      >
                        <div className="aspect-square bg-muted flex items-center justify-center relative">
                          {m.type === "video" ? (
                            <Video className="h-8 w-8 text-muted-foreground" />
                          ) : (
                            <Image src={m.url} alt="" fill className="w-full h-full object-cover" />
                          )}
                        </div>
                        <button
                          onClick={() => deleteMedia(m.id)}
                          className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                        <button
                          onClick={() => setThumb(m.id)}
                          className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white rounded px-1 flex items-center gap-1"
                        >
                          <Star className="h-3 w-3" /> {m.isThumbnail ? "Thumb" : "Set"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product files</CardTitle>
                <CardDescription>Files customers will download after purchase.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer block hover:border-primary">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add files</span>
                  <input type="file" multiple className="hidden" onChange={(e) => uploadFile(e.target.files)} />
                </label>
                <div className="space-y-2">
                  {files.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No files yet.</p>}
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 border rounded-md p-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.filename}</p>
                        <p className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <button onClick={() => deleteFile(f.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
                <CardDescription>Publish or unpublish this product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 text-sm">
                  <Switch checked={published} onCheckedChange={setPublished} />
                  <span>{published ? "Published (visible to buyers)" : "Draft (only you can see it)"}</span>
                </label>
              </CardContent>
            </Card>
            <Card className="border-red-300 mt-4">
              <CardHeader>
                <CardTitle className="text-red-600">Danger zone</CardTitle>
                <CardDescription>Permanently delete this product and all its files.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={del}>Delete product</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SaveIndicator({ status, savedAt, error }: { status: SaveStatus; savedAt: Date | null; error: string | null }) {
  if (error && status === "error") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <CloudOff className="h-4 w-4" /> {error}
      </div>
    )
  }
  if (status === "saving") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
      </div>
    )
  }
  if (status === "saved" || savedAt) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" /> Saved {savedAt ? formatRelative(savedAt) : "just now"}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Check className="h-4 w-4" /> All changes saved
    </div>
  )
}

function formatRelative(d: Date) {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 5) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return d.toLocaleTimeString()
}

function ContentRatingPicker({ value, onChange }: { value: "SFW" | "MATURE" | "NSFW"; onChange: (v: "SFW" | "MATURE" | "NSFW") => void }) {
  const options: { id: "SFW" | "MATURE" | "NSFW"; label: string; desc: string }[] = [
    { id: "SFW", label: "SFW", desc: "Safe for general audiences." },
    { id: "MATURE", label: "Mature", desc: "Contains mature or suggestive themes." },
    { id: "NSFW", label: "NSFW / Adult", desc: "Contains adult-oriented content." },
  ]
  return (
    <div className="space-y-2 border-t pt-4">
      <Label>Content rating</Label>
      <p className="text-xs text-muted-foreground">
        Controls how previews are shown to buyers. PawVault supports adult creators; NSFW listings remain visible but their previews are blurred until viewers choose to reveal them.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`text-left rounded-lg border p-3 text-sm transition-colors ${
              value === o.id ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20" : "hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{o.label}</span>
              {value === o.id && <Check className="h-4 w-4 text-purple-500" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{o.desc}</p>
          </button>
        ))}
      </div>
      {value === "NSFW" && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 p-3 text-xs">
          This product contains adult content. Its previews will be blurred for users who have not chosen to reveal adult content. PawVault does not block legitimate adult listings.
        </div>
      )}
    </div>
  )
}
