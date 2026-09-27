"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { EmptyState } from "@/components/empty-state"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Plus, Search, Pencil, Eye, History } from "lucide-react"
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-[32px]">
            My products
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Create, edit and publish your products.
          </p>
        </div>
        <Button asChild>
          <Link href="/creator/products/new">
            <Plus className="mr-2 h-4 w-4" /> New product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 self-start border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              aria-current={activeFilter === t.key}
              className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
                activeFilter === t.key
                  ? "border-accent font-medium text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs text-text-muted">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your products"
            aria-label="Search your products"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing here yet."
          description={
            query
              ? "No products match that search. Try a different term."
              : activeFilter === "drafts"
                ? "You have no drafts. Unpublished products land here."
                : activeFilter === "published"
                  ? "Nothing is published yet. Publish a draft to list it in your store."
                  : "Publish your first product and it will appear in your store and on Explore."
          }
          action={
            query
              ? undefined
              : { label: "Create a product", href: "/creator/products/new" }
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {filtered.map((p) => (
            <li key={p.id}>
              <ProductRow product={p} />
            </li>
          ))}
        </ul>
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
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-subtle">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <Package className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">
            {product.title || "Untitled product"}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
            <span className={product.isPublished ? "text-success" : "text-text-muted"}>
              {product.isPublished ? "Published" : "Draft"}
            </span>
            {product.category && <span>{product.category}</span>}
            <span>{product.mediaCount} images</span>
            <span>{product.fileCount} files</span>
            <span>{product.salesCount} sales</span>
            <span>Updated {formatRelative(updated)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-text-primary">{displayPrice}</p>
          {product.salePrice != null && !product.isFree && (
            <p className="text-xs text-text-muted line-through">
              {formatPrice(product.price)}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {product.isPublished && (
            <Button asChild size="sm" variant="ghost">
              <Link href={`/product/${product.slug}`} target="_blank">
                <Eye className="h-4 w-4" />
                <span className="sr-only">View {product.title}</span>
              </Link>
            </Button>
          )}
          <Button asChild size="sm" variant="ghost">
            <Link href={`/creator/products/${product.id}/versions`}>
              <History className="h-4 w-4" />
              <span className="sr-only">Versions of {product.title}</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/creator/products/${product.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>
    </div>
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
