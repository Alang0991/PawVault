"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatPrice } from "@/lib/helpers"
import Link from "next/link"
import {
  Plus,
  Trash2,
  Edit,
  FileText,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react"

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  status: "DRAFT" | "PUBLISHED"
  image?: string
  contentRating: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    displayName?: string
    avatar?: string
  }
  product?: {
    id: string
    title: string
    slug: string
    price: number
  }
}

export default function CreatorPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [formTitle, setFormTitle] = useState("")
  const [formSlug, setFormSlug] = useState("")
  const [formContent, setFormContent] = useState("")
  const [formExcerpt, setFormExcerpt] = useState("")
  const [formStatus, setFormStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT")
  const [formImage, setFormImage] = useState("")
  const [formContentRating, setFormContentRating] = useState("SFW")
  const [formProductId, setFormProductId] = useState("")
  const [products, setProducts] = useState<{ id: string; title: string; slug: string; price: number }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPosts()
    fetchProducts()
  }, [])

  async function fetchPosts() {
    try {
      const res = await fetch("/api/posts")
      const data = await res.json()
      if (res.ok) {
        setPosts(data.posts || [])
      }
    } catch (e) {
    } finally {
      setLoading(false)
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch("/api/creator/products")
      const data = await res.json()
      if (res.ok) {
        setProducts(data.products || [])
      }
    } catch (e) {
    }
  }

  function openCreateDialog() {
    setEditingPost(null)
    setFormTitle("")
    setFormSlug("")
    setFormContent("")
    setFormExcerpt("")
    setFormStatus("DRAFT")
    setFormImage("")
    setFormContentRating("SFW")
    setFormProductId("")
    setError("")
    setDialogOpen(true)
  }

  function openEditDialog(post: Post) {
    setEditingPost(post)
    setFormTitle(post.title)
    setFormSlug(post.slug)
    setFormContent("")
    setFormExcerpt(post.excerpt || "")
    setFormStatus(post.status)
    setFormImage(post.image || "")
    setFormContentRating(post.contentRating)
    setFormProductId(post.product?.id || "")
    setError("")
    setDialogOpen(true)
  }

  async function handleSave() {
    setError("")
    setSaving(true)

    try {
      const payload = {
        title: formTitle,
        slug: formSlug,
        content: formContent || " ",
        excerpt: formExcerpt || null,
        status: formStatus,
        image: formImage || null,
        contentRating: formContentRating,
        productId: formProductId || null,
      }

      if (editingPost) {
        const res = await fetch(`/api/posts/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to update post")
        }
      } else {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to create post")
        }
      }

      await fetchPosts()
      setDialogOpen(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(post: Post) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return
    }

    const res = await fetch(`/api/posts/${post.id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      await fetchPosts()
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim()
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Posts</h1>
            <p className="text-muted-foreground mt-1">Create announcements and updates for your storefront</p>
          </div>
          <Button onClick={openCreateDialog} className="gradient-bg text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : posts.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Create your first post to announce new products or updates to your customers.
              </p>
              <Button onClick={openCreateDialog} className="gradient-bg text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="truncate">{post.title}</CardTitle>
                        <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                          {post.status}
                        </Badge>
                        {post.contentRating !== "SFW" && (
                          <Badge variant="destructive">18+</Badge>
                        )}
                      </div>
                      {post.excerpt && (
                        <CardDescription className="line-clamp-1 mt-1">{post.excerpt}</CardDescription>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span>/{post.slug}</span>
                        <span>Created {new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.publishedAt && (
                          <span>Published {new Date(post.publishedAt).toLocaleDateString()}</span>
                        )}
                        {post.product && (
                          <Link href={`/product/${post.product.slug}`} className="flex items-center gap-1 hover:text-foreground">
                            <ExternalLink className="h-3 w-3" />
                            {post.product.title}
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" asChild aria-label="View post">
                        <Link href={`/store/${post.user.username}/post/${post.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)} aria-label="Edit post">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post)} aria-label="Delete post">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Post" : "Create Post"}</DialogTitle>
              <DialogDescription>
                {editingPost ? "Update your post." : "Create a new post for your storefront."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value)
                    if (!editingPost) {
                      setFormSlug(generateSlug(e.target.value))
                    }
                  }}
                  placeholder="New Avatar Release"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, "-"))}
                  placeholder="new-avatar-release"
                  disabled={!!editingPost}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt (optional)</Label>
                <Input
                  id="excerpt"
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="Short summary for post cards..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write your post content here..."
                  rows={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input
                  id="image"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formStatus} onValueChange={(value: "DRAFT" | "PUBLISHED") => setFormStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentRating">Content Rating</Label>
                  <Select value={formContentRating} onValueChange={setFormContentRating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SFW">SFW</SelectItem>
                      <SelectItem value="MATURE">Mature</SelectItem>
                      <SelectItem value="NSFW">NSFW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Link Product (optional)</Label>
                <Select value={formProductId} onValueChange={setFormProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.title} - {formatPrice(product.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formTitle || !formSlug || !formContent}>
                {saving ? "Saving..." : editingPost ? "Save Changes" : "Create Post"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
