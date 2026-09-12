"use client"

import { useState, useEffect } from "react"
import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Clock, Filter, ChevronDown } from "lucide-react"
import Link from "next/link"
import { SectionHeader } from "@/components/section-header"

interface Product {
  id: string
  title: string
  slug: string
  price: number
  salePrice: number | null
  isFree: boolean
  isOnSale: boolean
  media: Array<{ id: string; url: string }>
  creator: {
    id: string
    username: string
    displayName: string | null
    avatar: string | null
    isVerified: boolean
  }
  rating: number
  reviewCount: number
  category: { id: string; name: string; slug: string } | null
}

interface WishlistItem {
  id: string
  createdAt: string
  product: Product
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState("newest")
  const [filter, setFilter] = useState("all")
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [selectedCategory, setSelectedCategory] = useState("")

  useEffect(() => {
    loadWishlist()
    loadRecentlyViewed()
    loadCategories()
  }, [sort, filter, selectedCategory])

  const buildParams = () => {
    const params = new URLSearchParams()
    if (sort !== "newest") params.set("sort", sort)
    if (filter !== "all") params.set("filter", filter)
    if (selectedCategory) params.set("category", selectedCategory)
    return params.toString()
  }

  const loadWishlist = async () => {
    try {
      const params = buildParams()
      const res = await fetch(`/api/user/wishlist?${params}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch {
      setItems([])
    }
  }

  const loadRecentlyViewed = async () => {
    try {
      const res = await fetch("/api/user/recently-viewed")
      if (res.ok) {
        const data = await res.json()
        setRecentlyViewed(data.items || [])
      }
    } catch {
      setRecentlyViewed([])
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/user/wishlist")
      if (res.ok) {
        const data = await res.json()
        const cats = new Set<string>()
        data.items?.forEach((item: WishlistItem) => {
          if (item.product.category) {
            cats.add(JSON.stringify(item.product.category))
          }
        })
        setCategories([...cats].map((c) => JSON.parse(c)))
      }
    } catch {
      setCategories([])
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch("/api/user/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.product.id !== productId))
      }
    } catch {
      // error
    }
  }

const moveToCart = async (productId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      if (res.ok) {
        window.location.href = "/cart"
      }
    } catch {
      // error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <h1 className="text-3xl font-bold text-text-primary mb-8">Wishlist</h1>
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Wishlist</h1>
            <p className="text-sm text-text-secondary mt-1">
              {items.length}{" "}
              {items.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-muted" />
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A-Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z-A</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="on-sale">On Sale</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
              {categories.length > 0 && (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-text-muted" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Nothing saved yet.
            </h2>
            <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
              Find something worth keeping and it will appear here.
            </p>
            <Button asChild>
              <Link href="/browse">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          <>
            <ProductGrid products={items.map((i) => i.product)} onAddToCart={moveToCart} />
            {recentlyViewed.length > 0 && (
              <div className="mt-16">
                <SectionHeader
                  title="Recently Viewed"
                  subtitle="Products you've recently looked at"
                  icon={<Clock className="h-5 w-5" />}
                />
                <ProductGrid products={recentlyViewed} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}