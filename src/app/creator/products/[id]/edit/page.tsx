"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, X, Upload, FileText, Trash2, Star, Loader2 } from "lucide-react"

interface Category { id: string; name: string }
interface MediaItem { id: string; url: string; type: string; isThumbnail: boolean; order: number }
interface FileItem { id: string; filename: string; url: string; size: number; version?: string }
interface ProductTag { tag: { id: string; name: string } }

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const id = params.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [newTag, setNewTag] = useState("")
  const [progress, setProgress] = useState("")

  const [form, setForm] = useState({
    title: "", slug: "", subtitle: "", description: "", categoryId: "",
    tags: [] as string[], price: "", salePrice: "", isFree: false, isOnSale: false,
    isPublished: false, version: "", unityVersion: "", vrcSdkVersion: "",
    polygonCount: "", fileSize: "", pcCompatible: true, questCompatible: false,
    licenseType: "standard",
  })

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
          setMessage({ type: "error", text: err.error || "Product not found or access denied." })
          setLoading(false)
          return
        }
        const { product } = await prodRes.json()
        setMedia(product.media || [])
        setFiles(product.files || [])
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
          isPublished: product.isPublished || false,
          version: product.version || "",
          unityVersion: product.unityVersion || "",
          vrcSdkVersion: product.vrcSdkVersion || "",
          polygonCount: product.polygonCount ? String(product.polygonCount) : "",
          fileSize: product.fileSize ? String(product.fileSize) : "",
          pcCompatible: product.pcCompatible ?? true,
          questCompatible: product.questCompatible || false,
          licenseType: product.licenseType || "standard",
        })
      } catch {
        setMessage({ type: "error", text: "Failed to load product." })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/creator/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: form.isFree ? 0 : parseFloat(form.price),
          salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
          polygonCount: form.polygonCount ? parseInt(form.polygonCount) : undefined,
          fileSize: form.fileSize ? parseInt(form.fileSize) : undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setMessage({ type: "error", text: err.error || "Failed to save." })
      } else {
        setMessage({ type: "success", text: "Saved." })
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong." })
    } finally {
      setSaving(false)
    }
  }

  const uploadMedia = async (fileList: FileList | null) => {
    if (!fileList) return
    setProgress("Uploading images...")
    for (const f of Array.from(fileList)) {
      const fd = new FormData()
      fd.append("file", f)
      fd.append("productId", id)
      fd.append("isThumbnail", media.length === 0 ? "true" : "false")
      fd.append("order", String(media.length))
      const r = await fetch("/api/products/media", { method: "POST", body: fd })
      if (r.ok) {
        const { media: m } = await r.json()
        setMedia((prev) => [...prev, m])
      }
    }
    setProgress("")
  }

  const uploadFile = async (fileList: FileList | null) => {
    if (!fileList) return
    setProgress("Uploading files...")
    for (const f of Array.from(fileList)) {
      const fd = new FormData()
      fd.append("file", f)
      fd.append("productId", id)
      fd.append("version", form.version)
      const r = await fetch("/api/products/files", { method: "POST", body: fd })
      if (r.ok) {
        const { file } = await r.json()
        setFiles((prev) => [...prev, file])
      }
    }
    setProgress("")
  }

  const deleteMedia = async (mid: string) => {
    await fetch(`/api/products/media/${mid}`, { method: "DELETE" })
    setMedia((prev) => prev.filter((m) => m.id !== mid))
  }

  const setThumb = async (mid: string) => {
    // Upload as thumbnail by re-tagging: call media POST with same file is heavy;
    // simpler: optimistic local update + note. We update thumbnail via a small PUT not available,
    // so we just mark locally and rely on re-upload. For now toggle locally.
    setMedia((prev) => prev.map((m) => ({ ...m, isThumbnail: m.id === mid })))
  }

  const deleteFile = async (fid: string) => {
    await fetch(`/api/products/files/${fid}`, { method: "DELETE" })
    setFiles((prev) => prev.filter((f) => f.id !== fid))
  }

  const removeTag = (t: string) => setForm({ ...form, tags: form.tags.filter((x) => x !== t) })
  const addTag = (val: string) => {
    const clean = val.trim().replace(/,$/, "").toLowerCase()
    if (clean && !form.tags.includes(clean)) setForm({ ...form, tags: [...form.tags, clean] })
    setNewTag("")
  }

  const del = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return
    const res = await fetch(`/api/creator/products/${id}`, { method: "DELETE" })
    if (res.ok) router.push("/creator/products")
    else setMessage({ type: "error", text: "Failed to delete." })
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8"><p>Loading...</p></div>
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/creator/products"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">{form.isPublished ? "Published" : "Draft"}</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message.text}
          </div>
        )}
        {progress && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-700 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> {progress}
          </div>
        )}

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="danger">Danger</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Update your product information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
                    <Input value={newTag} placeholder="Add tag"
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(newTag) } }} />
                    <Button type="button" variant="outline" size="icon" onClick={() => addTag(newTag)}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (USD)</Label>
                    <Input type="number" step="0.01" value={form.price} disabled={form.isFree}
                      onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sale Price</Label>
                    <Input type="number" step="0.01" value={form.salePrice}
                      onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2"><Switch checked={form.isFree} onCheckedChange={(c) => setForm({ ...form, isFree: c })} /> Free</label>
                  <label className="flex items-center gap-2"><Switch checked={form.isOnSale} onCheckedChange={(c) => setForm({ ...form, isOnSale: c })} /> On Sale</label>
                  <label className="flex items-center gap-2"><Switch checked={form.isPublished} onCheckedChange={(c) => setForm({ ...form, isPublished: c })} /> Published</label>
                  <label className="flex items-center gap-2"><Switch checked={form.pcCompatible} onCheckedChange={(c) => setForm({ ...form, pcCompatible: c })} /> PC</label>
                  <label className="flex items-center gap-2"><Switch checked={form.questCompatible} onCheckedChange={(c) => setForm({ ...form, questCompatible: c })} /> Quest</label>
                </div>
                <Button onClick={save} disabled={saving} className="gradient-bg text-white">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Manage images and videos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer block hover:border-primary">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add images/videos</span>
                  <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => uploadMedia(e.target.files)} />
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {media.map((m) => (
                    <div key={m.id} className={`relative rounded-lg overflow-hidden border-2 ${m.isThumbnail ? "border-purple-500" : "border-transparent"}`}>
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {m.type === "video" ? <FileText className="h-8 w-8" /> : <img src={m.url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <button onClick={() => deleteMedia(m.id)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1">
                        <X className="h-3 w-3 text-white" />
                      </button>
                      <button onClick={() => setThumb(m.id)} className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white rounded px-1 flex items-center gap-1">
                        <Star className="h-3 w-3" /> {m.isThumbnail ? "Thumb" : "Set"}
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Files</CardTitle>
                <CardDescription>Manage downloadable files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer block hover:border-primary">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add files</span>
                  <input type="file" multiple className="hidden" onChange={(e) => uploadFile(e.target.files)} />
                </label>
                <div className="space-y-2">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 border rounded-md p-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">{f.filename}</span>
                      <span className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button onClick={() => deleteFile(f.id)}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" /></button>
                    </div>
                  ))}
                  {files.length === 0 && <p className="text-sm text-muted-foreground">No files yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="mt-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch checked={form.isPublished} onCheckedChange={(c) => setForm({ ...form, isPublished: c })} />
                  <span className="text-sm">{form.isPublished ? "Published (click to unpublish)" : "Draft (click to publish)"}</span>
                  <Button onClick={save} variant="outline" size="sm">Apply</Button>
                </div>
                <Button variant="destructive" onClick={del}>Delete Product</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
