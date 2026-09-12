"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Package, Loader2, Check, AlertCircle } from "lucide-react"

interface ProductOption {
  id: string
  title: string
  price: number
  salePrice: number | null
  isFree: boolean
  isOnSale: boolean
  thumbnail: string | null
}

export default function EditBundlePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [bundle, setBundle] = useState<any>(null)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    isPublished: false,
  })

  useEffect(() => {
    async function load() {
      try {
        const [bundleRes, productsRes] = await Promise.all([
          fetch(`/api/bundles/${params.id}`),
          fetch("/api/creator/products"),
        ])
        if (!bundleRes.ok) throw new Error("Bundle not found")
        if (!productsRes.ok) throw new Error("Failed to load products")
        const bundleData = await bundleRes.json()
        const productsData = await productsRes.json()
        setBundle(bundleData.bundle)
        setProducts(productsData.products || [])
        setSelectedIds(bundleData.bundle.items.map((item: any) => item.product.id))
        setForm({
          name: bundleData.bundle.name,
          description: bundleData.bundle.description || "",
          price: String(bundleData.bundle.price),
          isPublished: bundleData.bundle.isPublished,
        })
      } catch (err: any) {
        setError(err.message || "Could not load bundle")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id))
  const totalValue = selectedProducts.reduce(
    (sum, p) => sum + (p.isOnSale && p.salePrice != null ? p.salePrice : p.isFree ? 0 : p.price),
    0
  )

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Give your bundle a name.")
      return
    }
    if (selectedIds.length < 2) {
      setError("A bundle needs at least two products.")
      return
    }
    const price = Number(form.price)
    if (!form.price || isNaN(price) || price < 0) {
      setError("Enter a valid bundle price.")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/bundles/${bundle.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          price,
          productIds: selectedIds,
          isPublished: form.isPublished,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Could not update bundle")
      }
      setSaved(true)
      setTimeout(() => router.push("/creator/bundles"), 600)
    } catch (err: any) {
      setError(err.message || "Could not update bundle")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">Loading bundle...</p>
      </div>
    )
  }

  if (error && !bundle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/creator/bundles">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to bundles
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/creator/bundles">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit bundle</h1>
            <p className="text-sm text-muted-foreground">Update your bundle details and products.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {saved && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm flex items-center gap-2">
            <Check className="h-4 w-4" /> Bundle updated.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bundle details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-bundle-name">Bundle name</Label>
                  <Input
                    id="edit-bundle-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bundle-description">Description</Label>
                  <Textarea
                    id="edit-bundle-description"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Select the products included in this bundle.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {products.map((p) => {
                    const selected = selectedIds.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                          selected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                        }`}
                      >
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 mx-auto mt-2 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.isFree ? "Free" : `$${(p.isOnSale && p.salePrice != null ? p.salePrice : p.price).toFixed(2)}`}
                          </p>
                        </div>
                        {selected && <Check className="h-4 w-4 text-accent shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-bundle-price">Bundle price (USD)</Label>
                  <Input
                    id="edit-bundle-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Products selected</span>
                    <span>{selectedIds.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Combined value</span>
                    <span>${totalValue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="edit-bundle-published"
                    checked={form.isPublished}
                    onCheckedChange={(c) => setForm({ ...form, isPublished: c })}
                  />
                  <Label htmlFor="edit-bundle-published" className="text-sm">Published</Label>
                </div>
                <Button
                  className="w-full gradient-bg text-white"
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {submitting ? "Saving..." : "Save changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
