"use client"

import { useState, useEffect, useRef } from "react"
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
import { ArrowLeft, Plus, X, Upload, Tag, DollarSign, FileText, Image, Video, Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
}

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState("info")
  const [categories, setCategories] = useState<Category[]>([])
  const [newTag, setNewTag] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [thumbnailIndex, setThumbnailIndex] = useState(0)
  const [productFiles, setProductFiles] = useState<{ file: File; version: string; platform: string }[]>([])
  const [uploadProgress, setUploadProgress] = useState<string>("")

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    price: "",
    salePrice: "",
    categoryId: "",
    tags: [] as string[],
    isOnSale: false,
    isFree: false,
    isPublished: false,
    version: "",
    unityVersion: "",
    vrcSdkVersion: "",
    polygonCount: "",
    fileSize: "",
    questCompatible: false,
    pcCompatible: true,
    licenseType: "standard",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/categories")
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
        }
      } catch {
        /* non-fatal */
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Title is required." })
      setLoading(false)
      return
    }
    if (!formData.isFree && (!formData.price || parseFloat(formData.price) <= 0)) {
      setMessage({ type: "error", text: "Enter a valid price, or enable the Free toggle." })
      setLoading(false)
      return
    }
    if (mediaFiles.length === 0) {
      setMessage({ type: "error", text: "Add at least one thumbnail/gallery image." })
      setLoading(false)
      return
    }

    try {
      const createRes = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || undefined,
          price: formData.isFree ? 0 : parseFloat(formData.price),
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
          polygonCount: formData.polygonCount ? parseInt(formData.polygonCount) : undefined,
          fileSize: formData.fileSize ? parseInt(formData.fileSize) : undefined,
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.json()
        setMessage({ type: "error", text: err.error || "Failed to create product." })
        setLoading(false)
        return
      }

      const { product } = await createRes.json()
      const productId = product.id

      setUploadProgress("Uploading images...")
      for (let i = 0; i < mediaFiles.length; i++) {
        const fd = new FormData()
        fd.append("file", mediaFiles[i])
        fd.append("productId", productId)
        fd.append("isThumbnail", i === thumbnailIndex ? "true" : "false")
        fd.append("order", String(i))
        const r = await fetch("/api/products/media", { method: "POST", body: fd })
        if (!r.ok) {
          const err = await r.json()
          throw new Error(err.error || "Image upload failed")
        }
      }

      setUploadProgress("Uploading product files...")
      for (const pf of productFiles) {
        const fd = new FormData()
        fd.append("file", pf.file)
        fd.append("productId", productId)
        if (pf.version) fd.append("version", pf.version)
        if (pf.platform) fd.append("platform", pf.platform)
        const r = await fetch("/api/products/files", { method: "POST", body: fd })
        if (!r.ok) {
          const err = await r.json()
          throw new Error(err.error || "File upload failed")
        }
      }

      setUploadProgress("")
      setMessage({ type: "success", text: "Product created successfully!" })
      setTimeout(() => router.push("/creator/products"), 1200)
    } catch (error) {
      setUploadProgress("")
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong",
      })
      setLoading(false)
    }
  }

  const addTag = (name: string) => {
    const clean = name.trim().replace(/,$/, "").toLowerCase()
    if (!clean) return
    if (formData.tags.includes(clean)) {
      setNewTag("")
      return
    }
    setFormData({ ...formData, tags: [...formData.tags, clean] })
    setNewTag("")
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const onMediaSelected = (files: FileList | null) => {
    if (!files) return
    setMediaFiles((prev) => [...prev, ...Array.from(files)])
  }

  const onFilesSelected = (files: FileList | null) => {
    if (!files) return
    setProductFiles((prev) => [
      ...prev,
      ...Array.from(files).map((f) => ({ file: f, version: formData.version, platform: "" })),
    ])
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/creator/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Product</h1>
            <p className="text-muted-foreground">Add a new digital product to your store</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message.text}
          </div>
        )}
        {uploadProgress && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-700 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> {uploadProgress}
          </div>
        )}

        <Tabs value={currentStep} onValueChange={setCurrentStep} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit}>
          {currentStep === "info" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Product Information
                </CardTitle>
                <CardDescription>Basic details about your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" placeholder="My Awesome Asset" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input id="slug" placeholder="my-awesome-asset" value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Leave blank to auto-generate from the title.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input id="subtitle" placeholder="A short description" value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={6} placeholder="Describe your product in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select id="category" value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add a tag" value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault()
                          addTag(newTag)
                        }
                      }} />
                    <Button type="button" variant="outline" size="icon" onClick={() => addTag(newTag)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Press Enter or comma to add a tag.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "media" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" /> Media</CardTitle>
                <CardDescription>Upload a thumbnail and gallery images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer block">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-1">Click to add images</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WEBP, AVIF, MP4 (max 50MB)</p>
                  <input type="file" accept="image/*,video/*" multiple className="hidden"
                    onChange={(e) => onMediaSelected(e.target.files)} />
                </label>
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {mediaFiles.map((f, i) => (
                      <div key={i} className={`relative rounded-lg overflow-hidden border-2 ${i === thumbnailIndex ? "border-purple-500" : "border-transparent"}`}>
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          {f.type.startsWith("image") ? (
                            <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                          ) : (
                            <Video className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <button type="button" onClick={() => setMediaFiles(mediaFiles.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 bg-black/60 rounded-full p-1">
                          <X className="h-3 w-3 text-white" />
                        </button>
                        <button type="button" onClick={() => setThumbnailIndex(i)}
                          className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white rounded px-1">
                          {i === thumbnailIndex ? "Thumbnail" : "Set thumb"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === "files" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Product Files</CardTitle>
                <CardDescription>Upload downloadable files for this product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer block">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-1">Click to add files</p>
                  <p className="text-xs text-muted-foreground">ZIP, RAR, 7Z, PDF, images, source archives (max 10GB)</p>
                  <input type="file" multiple className="hidden" onChange={(e) => onFilesSelected(e.target.files)} />
                </label>
                {productFiles.length > 0 && (
                  <div className="space-y-2">
                    {productFiles.map((pf, i) => (
                      <div key={i} className="flex items-center gap-3 border rounded-md p-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{pf.file.name}</span>
                        <Input className="w-24" placeholder="v1.0" value={pf.version}
                          onChange={(e) => setProductFiles(productFiles.map((p, j) => j === i ? { ...p, version: e.target.value } : p))} />
                        <Input className="w-28" placeholder="Platform" value={pf.platform}
                          onChange={(e) => setProductFiles(productFiles.map((p, j) => j === i ? { ...p, platform: e.target.value } : p))} />
                        <button type="button" onClick={() => setProductFiles(productFiles.filter((_, j) => j !== i))}>
                          <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === "pricing" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Pricing</CardTitle>
                <CardDescription>Set your price and sale options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2">
                  <Switch id="isFree" checked={formData.isFree}
                    onCheckedChange={(c) => setFormData({ ...formData, isFree: c })} />
                  <Label htmlFor="isFree">This is a free product</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input id="price" type="number" step="0.01" min="0" placeholder="29.99"
                      value={formData.price} disabled={formData.isFree}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })} required={!formData.isFree} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price (optional)</Label>
                    <Input id="salePrice" type="number" step="0.01" min="0" placeholder="19.99"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="isOnSale" checked={formData.isOnSale}
                    onCheckedChange={(c) => setFormData({ ...formData, isOnSale: c })} />
                  <Label htmlFor="isOnSale">Mark as on sale</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "publish" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Publish</CardTitle>
                <CardDescription>Finalize and publish your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input id="version" placeholder="1.0" value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseType">License Type</Label>
                    <select id="licenseType" value={formData.licenseType}
                      onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="standard">Standard</option>
                      <option value="extended">Extended</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unityVersion">Unity Version</Label>
                    <Input id="unityVersion" placeholder="2021.3" value={formData.unityVersion}
                      onChange={(e) => setFormData({ ...formData, unityVersion: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vrcSdkVersion">VRChat SDK Version</Label>
                    <Input id="vrcSdkVersion" placeholder="2022.08.31.00" value={formData.vrcSdkVersion}
                      onChange={(e) => setFormData({ ...formData, vrcSdkVersion: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="polygonCount">Polygon Count</Label>
                    <Input id="polygonCount" type="number" placeholder="25000" value={formData.polygonCount}
                      onChange={(e) => setFormData({ ...formData, polygonCount: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fileSize">File Size (bytes)</Label>
                    <Input id="fileSize" type="number" placeholder="10485760" value={formData.fileSize}
                      onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch id="pcCompatible" checked={formData.pcCompatible}
                      onCheckedChange={(c) => setFormData({ ...formData, pcCompatible: c })} />
                    <Label htmlFor="pcCompatible">PC</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="questCompatible" checked={formData.questCompatible}
                      onCheckedChange={(c) => setFormData({ ...formData, questCompatible: c })} />
                    <Label htmlFor="questCompatible">Quest</Label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="isPublished" checked={formData.isPublished}
                    onCheckedChange={(c) => setFormData({ ...formData, isPublished: c })} />
                  <Label htmlFor="isPublished">Publish immediately (uncheck to save as draft)</Label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" disabled={currentStep === "info"}
              onClick={() => {
                const steps = ["info", "media", "files", "pricing", "publish"]
                const i = steps.indexOf(currentStep)
                if (i > 0) setCurrentStep(steps[i - 1])
              }}>
              Previous
            </Button>
            {currentStep !== "publish" ? (
              <Button type="button"
                onClick={() => {
                  const steps = ["info", "media", "files", "pricing", "publish"]
                  const i = steps.indexOf(currentStep)
                  if (i < steps.length - 1) setCurrentStep(steps[i + 1])
                }}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="gradient-bg text-white">
                {loading ? "Creating..." : "Create Product"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
