"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, X, Package, Loader2, Check, AlertCircle } from "lucide-react"

interface ProductOption {
  id: string
  title: string
  slug: string
  price: number
  salePrice: number | null
  isFree: boolean
  isOnSale: boolean
  thumbnail: string | null
}

export default function CreateBundlePage() {
  const router = useRouter()
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
    async function loadProducts() {
      try {
        const res = await fetch("/api/creator/products")
        if (!res.ok) throw new Error("Failed to load products")
        const data = await res.json()
        setProducts(data.products || [])
      } catch {
        setError("Could not load your products.")
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

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
      const res = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price,
          productIds: selectedIds,
          isPublished: form.isPublished,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Could not create bundle")
      }
      setSaved(true)
      setTimeout(() => router.push("/creator/bundles"), 600)
    } catch (err: any) {
      setError(err.message || "Could not create bundle")
    } finally {
      setSubmitting(false)
    }
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
            <h1 className="text-2xl font-bold">New bundle</h1>
            <p className="text-sm text-muted-foreground">
              Group two or more of your products and sell them together at a discount.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {saved && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm flex items-center gap-2">
            <Check className="h-4 w-4" /> Bundle created.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bundle details</CardTitle>
                <CardDescription>Name your bundle and add a short description.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bundle-name">Bundle name</Label>
                  <Input
                    id="bundle-name"
                    placeholder="e.g. Starter Pack"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundle-description">Description (optional)</Label>
                  <Textarea
                    id="bundle-description"
                    rows={4}
                    placeholder="What's included and who it's for."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Select at least two of your published products.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground py-4">Loading products...</p>
                ) : products.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    You don't have any products yet.{" "}
                    <Link href="/creator/products/new" className="text-accent hover:underline">
                      Create one first.
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {products.map((p) => {
                      const selected = selectedIds.includes(p.id)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleProduct(p.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                            selected
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50"
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
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set one price for the whole bundle.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bundle-price">Bundle price (USD)</Label>
                  <Input
                    id="bundle-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="19.99"
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
                  {form.price && !isNaN(Number(form.price)) && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Customer saves</span>
                      <span>${Math.max(0, totalValue - Number(form.price)).toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="bundle-published"
                    checked={form.isPublished}
                    onCheckedChange={(c) => setForm({ ...form, isPublished: c })}
                  />
                  <Label htmlFor="bundle-published" className="text-sm">
                    Publish immediately
                  </Label>
                </div>
                <Button
                  className="w-full gradient-bg text-white"
                  onClick={submit}
                  disabled={submitting || selectedIds.length < 2}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  {submitting ? "Creating..." : "Create bundle"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
