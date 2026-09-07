"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/helpers"
import Link from "next/link"
import Image from "next/image"
import {
  Plus,
  Trash2,
  Edit,
  Package,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Globe,
  Lock,
} from "lucide-react"

interface CollectionItem {
  id: string
  productId: string
  order: number
  product: {
    id: string
    title: string
    price: number
    slug: string
    media?: { url: string }[]
  }
}

interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  coverImage?: string
  isPublic: boolean
  items: CollectionItem[]
  createdAt: string
  updatedAt: string
}

export default function CreatorCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [formName, setFormName] = useState("")
  const [formSlug, setFormSlug] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formCoverImage, setFormCoverImage] = useState("")
  const [formIsPublic, setFormIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCollections()
  }, [])

  async function fetchCollections() {
    try {
      const res = await fetch("/api/collections")
      const data = await res.json()
      if (res.ok) {
        setCollections(data.collections || [])
      }
    } catch (e) {
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingCollection(null)
    setFormName("")
    setFormSlug("")
    setFormDescription("")
    setFormCoverImage("")
    setFormIsPublic(true)
    setError("")
    setDialogOpen(true)
  }

  function openEditDialog(collection: Collection) {
    setEditingCollection(collection)
    setFormName(collection.name)
    setFormSlug(collection.slug)
    setFormDescription(collection.description || "")
    setFormCoverImage(collection.coverImage || "")
    setFormIsPublic(collection.isPublic)
    setError("")
    setDialogOpen(true)
  }

  async function handleSave() {
    setError("")
    setSaving(true)

    try {
      const payload = {
        name: formName,
        slug: formSlug,
        description: formDescription || null,
        coverImage: formCoverImage || null,
        isPublic: formIsPublic,
      }

      if (editingCollection) {
        const res = await fetch(`/api/collections/${editingCollection.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to update collection")
        }
      } else {
        const res = await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to create collection")
        }
      }

      await fetchCollections()
      setDialogOpen(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(collection: Collection) {
    if (!confirm(`Delete "${collection.name}"? This cannot be undone.`)) {
      return
    }

    const res = await fetch(`/api/collections/${collection.id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      await fetchCollections()
    }
  }

  async function moveItem(collectionId: string, itemId: string, direction: "up" | "down") {
    const collection = collections.find((c) => c.id === collectionId)
    if (!collection) return

    const items = [...collection.items].sort((a, b) => a.order - b.order)
    const idx = items.findIndex((i) => i.id === itemId)
    if (idx === -1) return

    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= items.length) return

    const temp = items[idx].order
    items[idx] = { ...items[idx], order: items[newIdx].order }
    items[newIdx] = { ...items[newIdx], order: temp }

    await Promise.all(
      items.map((item) =>
        fetch(`/api/collections/${collectionId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.productId, order: item.order }),
        })
      )
    )

    await fetchCollections()
  }

  async function removeItem(collectionId: string, itemId: string) {
    const res = await fetch(`/api/collections/${collectionId}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: itemId }),
    })

    if (res.ok) {
      await fetchCollections()
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-muted-foreground mt-1">Organize your products into curated collections</p>
          </div>
          <Button onClick={openCreateDialog} className="gradient-bg text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : collections.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Collections help customers browse your products by category. Create your first collection to get started.
              </p>
              <Button onClick={openCreateDialog} className="gradient-bg text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Collection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {collections.map((collection) => (
              <Card key={collection.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {collection.coverImage ? (
                        <Image
                          src={collection.coverImage}
                          alt=""
                          width={64}
                          height={64}
                          className="rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                          📚
                        </div>
                      )}
                      <div className="min-w-0">
                        <CardTitle className="truncate">{collection.name}</CardTitle>
                        {collection.description && (
                          <CardDescription className="line-clamp-1">{collection.description}</CardDescription>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {collection.items.length} product{collection.items.length === 1 ? "" : "s"} · Updated{" "}
                            {new Date(collection.updatedAt).toLocaleDateString()}
                          </p>
                          <Badge variant={collection.isPublic ? "default" : "secondary"} className="text-xs">
                            {collection.isPublic ? (
                              <><Globe className="h-3 w-3 mr-1" /> Public</>
                            ) : (
                              <><Lock className="h-3 w-3 mr-1" /> Private</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(collection)} aria-label="Edit collection">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(collection)} aria-label="Delete collection">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {collection.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">This collection is empty.</p>
                  ) : (
                    <div className="space-y-2">
                      {collection.items
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((item, idx, arr) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                              {item.product.media?.[0]?.url ? (
                                <Image
                                  src={item.product.media[0].url}
                                  alt={item.product.title}
                                  width={64}
                                  height={64}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.product.title}</p>
                              <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={idx === 0}
                                onClick={() => moveItem(collection.id, item.id, "up")}
                                aria-label="Move up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={idx === arr.length - 1}
                                onClick={() => moveItem(collection.id, item.id, "down")}
                                aria-label="Move down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(collection.id, item.id)}
                                aria-label="Remove from collection"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCollection ? "Edit Collection" : "Create Collection"}</DialogTitle>
              <DialogDescription>
                {editingCollection
                  ? "Update your collection details."
                  : "Create a new collection to organize your products."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VRChat Avatars"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, "-"))}
                  placeholder="vrchat-avatars"
                  disabled={!!editingCollection}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="A collection of my VRChat avatar products..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={formCoverImage}
                  onChange={(e) => setFormCoverImage(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label className="text-base">Public collection</Label>
                  <p className="text-xs text-muted-foreground">
                    Public collections are visible on your storefront. Private collections are only visible to you.
                  </p>
                </div>
                <Switch checked={formIsPublic} onCheckedChange={setFormIsPublic} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !formName || !formSlug}>
                {saving ? "Saving..." : editingCollection ? "Save Changes" : "Create Collection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
