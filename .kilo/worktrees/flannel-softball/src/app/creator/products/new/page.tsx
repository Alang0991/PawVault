"use client"

import { useEffect, useRef, useState } from "react"
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
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  FileText,
  ImageIcon,
  Video,
  Loader2,
  Check,
  CloudOff,
  Trash2,
  Star,
  AlertCircle,
} from "lucide-react"
import NextImage from "next/image"

interface Category {
  id: string
  name: string
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

interface MediaItem {
  id?: string
  file?: File
  url: string
  type: "image" | "video"
  isThumbnail: boolean
  uploading?: boolean
  error?: string
}

interface ProductFileItem {
  id?: string
  file?: File
  filename: string
  size: number
  version?: string
  platform?: string
  uploading?: boolean
  error?: string
}

const REQUIRED_TO_PUBLISH = [
  "title",
  "description",
  "categoryId",
  "price",
  "media",
] as const

export default function CreateProductPage() {
  const router = useRouter()
  const [productId, setProductId] = useState<string | null>(null)
  const [step, setStep] = useState("info")
  const [categories, setCategories] = useState<Category[]>([])
  const [newTag, setNewTag] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [files, setFiles] = useState<ProductFileItem[]>([])

  const [form, setForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    price: "",
    salePrice: "",
    categoryId: "",
    tags: [] as string[],
    isFree: false,
    isOnSale: false,
    isPublished: false,
  })

  const draftRef = useRef(form)
  draftRef.current = form

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch("/api/categories")
        if (!res.ok) return
        const data = await res.json()
        setCategories(data.categories || [])
      } catch {
        /* non-fatal */
      }
    }
    loadCats()
  }, [])

  async function ensureDraft() {
    if (productId) return productId
    if (!draftRef.current.title.trim()) {
      setCreateError("Give your product a title to start saving your draft.")
      throw new Error("title-required")
    }
    setCreateError(null)
    setStatus("saving")
    const res = await fetch("/api/creator/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draftRef.current.title.trim(),
        slug: draftRef.current.slug || undefined,
        subtitle: draftRef.current.subtitle || undefined,
        description: draftRef.current.description || undefined,
        price: draftRef.current.isFree ? 0 : Number(draftRef.current.price) || 0,
        salePrice: draftRef.current.salePrice ? Number(draftRef.current.salePrice) : undefined,
        categoryId: draftRef.current.categoryId || undefined,
        tags: draftRef.current.tags,
        isFree: draftRef.current.isFree,
        isOnSale: draftRef.current.isOnSale,
        isPublished: false,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setStatus("error")
      setCreateError(err.error || "We couldn't start your draft. Please try again.")
      throw new Error("create-failed")
    }
    const data = await res.json()
    const id = data.product?.id || data.id
    setProductId(id)
    setStatus("saved")
    setSavedAt(new Date())
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", `/creator/products/${id}/edit`)
    }
    return id
  }

  async function saveDraft() {
    if (!productId) {
      try {
        await ensureDraft()
      } catch {
        return
      }
      return
    }
    setStatus("saving")
    setError(null)
    try {
      const res = await fetch(`/api/creator/products/${productId}/autosave`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            slug: form.slug || undefined,
            subtitle: form.subtitle || null,
            description: form.description || null,
            price: form.isFree ? 0 : Number(form.price) || 0,
            salePrice: form.salePrice ? Number(form.salePrice) : null,
            categoryId: form.categoryId || null,
            tags: form.tags,
            isFree: form.isFree,
            isOnSale: form.isOnSale,
          }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setStatus("error")
        setError(err.error || "We couldn't save your draft.")
        return
      }
      setStatus("saved")
      setSavedAt(new Date())
    } catch {
      setStatus("error")
      setError("Network error. Your changes are safe — we'll retry when you're back online.")
    }
  }

  useEffect(() => {
    if (!productId) return
    const t = setTimeout(() => {
      saveDraft()
    }, 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, productId])

  useEffect(() => {
    function onUnload(e: BeforeUnloadEvent) {
      if (status === "saving") {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", onUnload)
    return () => window.removeEventListener("beforeunload", onUnload)
  }, [status])

  async function publish() {
    const missing = missingForPublish()
    if (missing.length > 0) {
      setError(`Add the following before publishing: ${missing.join(", ")}.`)
      return
    }
    try {
      const id = productId || (await ensureDraft())
      const res = await fetch(`/api/creator/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PENDING_REVIEW",
          isPublished: true,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || "We couldn't submit this product for review.")
        return
      }
      router.push("/creator/products")
    } catch {
      setError("We couldn't submit this product. Please try again.")
    }
  }

  function missingForPublish(): string[] {
    const out: string[] = []
    if (!form.title.trim()) out.push("title")
    if (!form.description.trim()) out.push("description")
    if (!form.categoryId) out.push("category")
    if (!form.isFree && (!form.price || Number(form.price) <= 0)) out.push("price")
    if (media.length === 0) out.push("thumbnail image")
    return out
  }

  async function uploadMedia(file: File, isThumb: boolean) {
    const localUrl = URL.createObjectURL(file)
    const temp: MediaItem = {
      file,
      url: localUrl,
      type: file.type.startsWith("video") ? "video" : "image",
      isThumbnail: isThumb,
      uploading: true,
    }
    setMedia((prev) => {
      const next = [...prev, temp]
      if (isThumb) next.forEach((m) => { if (m !== temp) m.isThumbnail = false })
      return next
    })
    try {
      const id = productId || (await ensureDraft())
      const fd = new FormData()
      fd.append("file", file)
      fd.append("productId", id)
      fd.append("isThumbnail", isThumb ? "true" : "false")
      fd.append("order", String(media.length))
      const r = await fetch("/api/products/media", { method: "POST", body: fd })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        setMedia((prev) => prev.map((m) => (m === temp ? { ...m, uploading: false, error: err.error || "Upload failed" } : m)))
        return
      }
      const { media: saved } = await r.json()
      setMedia((prev) => prev.map((m) => (m === temp ? { ...m, id: saved.id, url: saved.url, type: saved.type, uploading: false } : m)))
    } catch {
      setMedia((prev) => prev.map((m) => (m === temp ? { ...m, uploading: false, error: "Network error" } : m)))
    }
  }

  async function removeMedia(idx: number) {
    const item = media[idx]
    if (item.id) {
      await fetch(`/api/products/media/${item.id}`, { method: "DELETE" })
    }
    setMedia((prev) => prev.filter((_, i) => i !== idx))
  }

  async function setThumbnail(idx: number) {
    const item = media[idx]
    setMedia((prev) => prev.map((m, i) => ({ ...m, isThumbnail: i === idx })))
    if (item.id && productId) {
      await fetch(`/api/creator/products/${productId}/media/${item.id}/thumbnail`, { method: "POST" })
    }
  }

  async function uploadProductFile(file: File) {
    const temp: ProductFileItem = { file, filename: file.name, size: file.size, uploading: true }
    setFiles((prev) => [...prev, temp])
    try {
      const id = productId || (await ensureDraft())
      const fd = new FormData()
      fd.append("file", file)
      fd.append("productId", id)
      const r = await fetch("/api/products/files", { method: "POST", body: fd })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        setFiles((prev) => prev.map((f, i) => (f === temp ? { ...f, uploading: false, error: err.error || "Upload failed" } : f)))
        return
      }
      const { file: saved } = await r.json()
      setFiles((prev) => prev.map((f) => (f === temp ? { ...f, id: saved.id, filename: saved.filename, size: saved.size, uploading: false } : f)))
    } catch {
      setFiles((prev) => prev.map((f) => (f === temp ? { ...f, uploading: false, error: "Network error" } : f)))
    }
  }

  async function removeFile(idx: number) {
    const item = files[idx]
    if (item.id) {
      await fetch(`/api/products/files/${item.id}`, { method: "DELETE" })
    }
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  function addTag(raw: string) {
    const clean = raw.trim().replace(/,$/, "").toLowerCase()
    if (!clean) return
    if (form.tags.includes(clean)) {
      setNewTag("")
      return
    }
    setForm({ ...form, tags: [...form.tags, clean] })
    setNewTag("")
  }

  const onMediaChange = (list: FileList | null) => {
    if (!list) return
    const files = Array.from(list)
    files.forEach((f, i) => {
      const isThumb = media.length === 0 && i === 0
      uploadMedia(f, isThumb)
    })
  }

  const onFileChange = (list: FileList | null) => {
    if (!list) return
    Array.from(list).forEach((f) => uploadProductFile(f))
  }

  const missing = missingForPublish()
  const canPublish = missing.length === 0

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/creator/products">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">New product</h1>
              <p className="text-sm text-muted-foreground">Your draft saves automatically as you type.</p>
            </div>
          </div>
          <SaveIndicator status={status} savedAt={savedAt} error={error} />
        </div>

        {createError && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {createError}
          </div>
        )}

        <Tabs value={step} onValueChange={setStep} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-6">
          {step === "info" && (
            <Card>
              <CardHeader>
                <CardTitle>Product information</CardTitle>
                <CardDescription>Tell buyers what they're getting. Only a title is required to start.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g. Cozy Cottage Avatar"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Short description</Label>
                  <Input
                    id="subtitle"
                    placeholder="One sentence that shows up in search"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Full description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    rows={6}
                    placeholder="What's included, how to use it, and anything buyers should know."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL slug</Label>
                  <Input
                    id="slug"
                    placeholder="auto-generated-from-title"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Leave blank to generate from your title.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault()
                          addTag(newTag)
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => addTag(newTag)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Press Enter or comma to add.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "media" && (
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>Upload a thumbnail and gallery images. The first image becomes the thumbnail by default.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer block">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-1">Click or drop images here</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WEBP, AVIF, MP4</p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onMediaChange(e.target.files)}
                  />
                </label>
                {media.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {media.map((m, i) => (
                      <div
                        key={i}
                        className={`relative rounded-lg overflow-hidden border-2 ${m.isThumbnail ? "border-purple-500" : "border-transparent"}`}
                      >
                        <div className="aspect-square bg-muted relative flex items-center justify-center">
                          {m.uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          ) : m.type === "image" ? (
                            <NextImage src={m.url} alt="" fill className="object-cover" />
                          ) : (
                            <Video className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedia(i)}
                          className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setThumbnail(i)}
                          className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white rounded px-1 flex items-center gap-1"
                        >
                          <Star className="h-3 w-3" /> {m.isThumbnail ? "Thumbnail" : "Set"}
                        </button>
                        {m.error && (
                          <div className="absolute inset-0 bg-red-500/70 text-white text-[10px] p-1">{m.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {media.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No media yet.</p>
                )}
              </CardContent>
            </Card>
          )}

          {step === "files" && (
            <Card>
              <CardHeader>
                <CardTitle>Product files</CardTitle>
                <CardDescription>Add the files customers will download after purchase.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer block">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-1">Click or drop files here</p>
                  <p className="text-xs text-muted-foreground">ZIP, RAR, 7Z, PDF, source archives (up to 10GB)</p>
                  <input type="file" multiple className="hidden" onChange={(e) => onFileChange(e.target.files)} />
                </label>
                <div className="space-y-2">
                  {files.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No files yet.</p>}
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 border rounded-md p-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {(f.size / 1024 / 1024).toFixed(1)} MB
                          {f.uploading ? " · uploading..." : f.error ? ` · ${f.error}` : ""}
                        </p>
                      </div>
                      <button type="button" onClick={() => removeFile(i)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === "publish" && (
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
                <CardDescription>Set a price and publish when you're ready.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isFree"
                    checked={form.isFree}
                    onCheckedChange={(c) => setForm({ ...form, isFree: c })}
                  />
                  <Label htmlFor="isFree">This is a free product</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) <span className="text-red-500">*</span></Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="29.99"
                      value={form.price}
                      disabled={form.isFree}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale price (optional)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="19.99"
                      value={form.salePrice}
                      onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    />
                  </div>
                </div>

                {missing.length > 0 && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 p-3 text-sm">
                    <p className="font-medium mb-1">Before you can publish:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {missing.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={publish}
                    disabled={!canPublish}
                    className="gradient-bg text-white"
                  >
                    {form.isPublished ? "Save & keep published" : "Publish product"}
                  </Button>
                  <Button variant="outline" onClick={saveDraft}>Save draft</Button>
                  <Button asChild variant="ghost">
                    <Link href="/creator/products">Back to products</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={step === "info"}
              onClick={() => {
                const steps = ["info", "media", "files", "publish"]
                const i = steps.indexOf(step)
                if (i > 0) setStep(steps[i - 1])
              }}
            >
              Previous
            </Button>
            {step !== "publish" && (
              <Button
                type="button"
                onClick={() => {
                  const steps = ["info", "media", "files", "publish"]
                  const i = steps.indexOf(step)
                  if (i < steps.length - 1) setStep(steps[i + 1])
                }}
              >
                Next
              </Button>
            )}
          </div>
        </div>
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
      <ImageIcon className="h-4 w-4" aria-hidden="true" /> Draft not saved yet
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
