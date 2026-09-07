"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, Plus, Search, Pencil, Eye } from "lucide-react"
import { formatPrice } from "@/lib/helpers"

export interface ProductListItem {
  id: string
  title: string
  slug: string
  price: number
  salePrice: number | null
  isFree: boolean
  isPublished: boolean
  isOnSale: boolean
  category: string | null
  thumbnail: string | null
  fileCount: number
  mediaCount: number
  salesCount: number
  reviewCount: number
  updatedAt: string
  createdAt: string
}

interface Props {
  products: ProductListItem[]
  counts: { all: number; drafts: number; published: number }
  activeFilter: string
}

export function ProductsList({ products, counts, activeFilter }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter((p) => p.title.toLowerCase().includes(q))
  }, [products, query])

  const tabs = [
    { key: "all", label: "All", count: counts.all },
    { key: "drafts", label: "Drafts", count: counts.drafts },
    { key: "published", label: "Published", count: counts.published },
  ]

  function setFilter(key: string) {
    const sp = new URLSearchParams(params?.toString() || "")
    if (key === "all") sp.delete("filter")
    else sp.set("filter", key)
    router.push(`/creator/products${sp.toString() ? `?${sp.toString()}` : ""}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My products</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and publish your digital products.
          </p>
        </div>
        <Button asChild className="gradient-bg text-white">
          <Link href="/creator/products/new">
            <Plus className="mr-2 h-4 w-4" /> New product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-muted p-1 self-start">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeFilter === t.key
                  ? "bg-background shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              <span className="ml-2 text-xs text-muted-foreground">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">
              {query
                ? "No products match your search"
                : activeFilter === "drafts"
                ? "No drafts"
                : activeFilter === "published"
                ? "Nothing published yet"
                : "You haven't created any products yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {query ? "Try a different search term." : "Get started by creating your first product."}
            </p>
            {!query && (
              <Button asChild>
                <Link href="/creator/products/new">
                  <Plus className="mr-2 h-4 w-4" /> Create your first product
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductRow({ product }: { product: ProductListItem }) {
  const updated = new Date(product.updatedAt)
  const displayPrice = product.isFree
    ? "Free"
    : product.salePrice != null
    ? formatPrice(product.salePrice)
    : formatPrice(product.price)

  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
            {product.thumbnail ? (
              <Image src={product.thumbnail} alt={product.title} width={64} height={64} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold truncate">{product.title || "Untitled product"}</p>
              <Badge variant={product.isPublished ? "default" : "secondary"}>
                {product.isPublished ? "Published" : "Draft"}
              </Badge>
              {product.isOnSale && <Badge variant="destructive">On sale</Badge>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {product.category && <span>{product.category}</span>}
              <span>{product.mediaCount} image{product.mediaCount === 1 ? "" : "s"}</span>
              <span>{product.fileCount} file{product.fileCount === 1 ? "" : "s"}</span>
              <span>{product.salesCount} sale{product.salesCount === 1 ? "" : "s"}</span>
              <span>Updated {formatRelative(updated)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <div className="text-right">
            <p className="font-semibold">{displayPrice}</p>
            {product.salePrice != null && !product.isFree && (
              <p className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</p>
            )}
          </div>
          <div className="flex gap-2">
            {product.isPublished && (
              <Button asChild size="sm" variant="ghost">
                <Link href={`/products/${product.slug}`} target="_blank">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Link>
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <Link href={`/creator/products/${product.id}/edit`}>
                <Pencil className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatRelative(d: Date) {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString()
}
