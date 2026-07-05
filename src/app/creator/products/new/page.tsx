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
import { ArrowLeft, Plus, X, Upload, Tag, DollarSign, FileText, Image, Video } from "lucide-react"

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState("info")
  const [categories, setCategories] = useState<any[]>([])
  const [allTags, setAllTags] = useState<any[]>([])
  const [newTag, setNewTag] = useState("")
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    price: "",
    salePrice: "",
    categoryId: "",
    tags: [] as string[],
    isOnSale: false,
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
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/creator/tags'),
        ])
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.categories || [])
        }
        
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          setAllTags(tagsData.tags || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
          polygonCount: formData.polygonCount ? parseInt(formData.polygonCount) : undefined,
          fileSize: formData.fileSize ? parseInt(formData.fileSize) : undefined,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Asset created successfully!' })
        setTimeout(() => router.push("/creator/products"), 1500)
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Something went wrong' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  const addTag = async (tagName: string) => {
    if (!tagName.trim()) return
    
    const existingTag = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase())
    if (existingTag) {
      setFormData({ ...formData, tags: [...formData.tags, existingTag.id] })
      return
    }

    try {
      const res = await fetch('/api/creator/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName }),
      })

      if (res.ok) {
        const data = await res.json()
        setAllTags([...allTags, data.tag])
        setFormData({ ...formData, tags: [...formData.tags, data.tag.id] })
        setNewTag("")
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const removeTag = (tagId: string) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(id => id !== tagId) 
    })
  }

  const selectedTags = allTags.filter(tag => formData.tags.includes(tag.id))

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
            <h1 className="text-3xl font-bold">Upload Asset</h1>
            <p className="text-muted-foreground">Add a new VRChat asset to your store</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
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
                  <FileText className="h-5 w-5" />
                  Asset Information
                </CardTitle>
                <CardDescription>Basic details about your asset</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="My Awesome Asset"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    placeholder="A short description"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={6}
                    placeholder="Describe your asset in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => removeTag(tag.id)}
                          className="ml-1 hover:text-red-500"
                        >
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
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(newTag)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => addTag(newTag)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Press Enter or click + to add a tag. Tags help customers find your asset.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "media" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Media
                </CardTitle>
                <CardDescription>Upload images and videos for your asset</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Drag and drop files here, or click to browse</p>
                  <Button type="button" variant="outline">Browse Files</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports: JPG, PNG, GIF, MP4 (max 50MB)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "files" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Asset Files
                </CardTitle>
                <CardDescription>Upload the importable files for this asset</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Drag and drop files here, or click to browse</p>
                  <Button type="button" variant="outline">Browse Files</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports: ZIP, RAR, 7Z, FBX, OBJ, PNG, PSD (max 500MB)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "pricing" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </CardTitle>
                <CardDescription>Set your asset price and sale options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="29.99"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price (optional)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="19.99"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isOnSale"
                    checked={formData.isOnSale}
                    onCheckedChange={(checked) => setFormData({ ...formData, isOnSale: checked })}
                  />
                  <Label htmlFor="isOnSale">On Sale</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "publish" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Publish</CardTitle>
                <CardDescription>Finalize and publish your asset</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      placeholder="1.0"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unityVersion">Unity Version</Label>
                    <Input
                      id="unityVersion"
                      placeholder="2021.3"
                      value={formData.unityVersion}
                      onChange={(e) => setFormData({ ...formData, unityVersion: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vrcSdkVersion">VRChat SDK Version</Label>
                    <Input
                      id="vrcSdkVersion"
                      placeholder="2022.08.31.00"
                      value={formData.vrcSdkVersion}
                      onChange={(e) => setFormData({ ...formData, vrcSdkVersion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseType">License Type</Label>
                    <select
                      id="licenseType"
                      value={formData.licenseType}
                      onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="standard">Standard</option>
                      <option value="extended">Extended</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <Label htmlFor="isPublished">Publish immediately</Label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const steps = ["info", "media", "files", "pricing", "publish"]
                const currentIndex = steps.indexOf(currentStep)
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1])
                }
              }}
              disabled={currentStep === "info"}
            >
              Previous
            </Button>
            {currentStep !== "publish" ? (
              <Button
                type="button"
                onClick={() => {
                  const steps = ["info", "media", "files", "pricing", "publish"]
                  const currentIndex = steps.indexOf(currentStep)
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1])
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800">
                {loading ? "Creating..." : "Upload Asset"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
