"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { X, Filter, Tag, Star } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  _count?: { products: number }
}

interface Tag {
  id: string
  name: string
  slug: string
  _count?: { products: number }
}

interface CategoryFiltersProps {
  categories: Category[]
  popularTags: Tag[]
  searchParams: Record<string, string | undefined>
  tagList: string[]
  showClear?: boolean
}

export function CategoryFilters({
  categories,
  popularTags,
  searchParams,
  tagList,
  showClear = true,
}: CategoryFiltersProps) {
  const router = useRouter()
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/counts?type=categories")
        if (res.ok) {
          const data = await res.json()
          const map: Record<string, number> = {}
          for (const c of data.categories || []) {
            map[c.slug] = c._count?.products || 0
          }
          setCounts(map)
        }
      } catch {}
    }
    fetchCounts()
  }, [])

  const activeFilters = Boolean(
    searchParams.priceMin ||
      searchParams.priceMax ||
      searchParams.rating ||
      searchParams.tags ||
      searchParams.free ||
      searchParams.onSale
  )

  const buildHref = (
    overrides: Record<string, string | undefined>
  ) => {
    const params = new URLSearchParams(
      Object.entries(searchParams)
        .filter(([, v]) => v)
        .map(([k, v]) => [k, v as string])
    )
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) params.delete(k)
      else params.set(k, v)
    }
    const qs = params.toString()
    return qs ? `/browse?${qs}` : "/browse"
  }

  const toggleTag = (tagSlug: string) => {
    const next = tagList.includes(tagSlug)
      ? tagList.filter((t) => t !== tagSlug)
      : [...tagList, tagSlug]
    buildHref({ tags: next.join(",") || undefined, page: undefined })
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </CardTitle>
        {activeFilters && showClear && (
          <Link href="/browse" className="text-xs text-sale hover:underline">
            Clear all
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4">
          <input type="hidden" name="sort" value={searchParams.sort || "newest"} />

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted">Search</Label>
            <input
              name="q"
              defaultValue={searchParams.q || ""}
              placeholder="Search products..."
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted">Category</Label>
            <select
              name="category"
              defaultValue={searchParams.category || ""}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                  {counts[c.slug] !== undefined ? ` (${counts[c.slug]})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted">Price</Label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="priceMin"
                placeholder="Min"
                defaultValue={searchParams.priceMin || ""}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
              <span className="text-text-muted">-</span>
              <input
                type="number"
                name="priceMax"
                placeholder="Max"
                defaultValue={searchParams.priceMax || ""}
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted">Min rating</Label>
            <select
              name="rating"
              defaultValue={searchParams.rating || ""}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="">Any</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-1.5 text-xs text-text-secondary">
              <input
                type="checkbox"
                name="free"
                value="true"
                defaultChecked={searchParams.free === "true"}
                className="accent-accent"
              />
              Free
            </label>
            <label className="flex items-center gap-1.5 text-xs text-text-secondary">
              <input
                type="checkbox"
                name="onSale"
                value="true"
                defaultChecked={searchParams.onSale === "true"}
                className="accent-accent"
              />
              On sale
            </label>
          </div>

          {popularTags.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-text-muted flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {popularTags.map((t) => {
                  const active = tagList.includes(t.slug)
                  return (
                    <a
                      key={t.id}
                      href={buildHref({
                        tags: active
                          ? tagList.filter((x) => x !== t.slug).join(",") || undefined
                          : [...tagList, t.slug].join(","),
                        page: undefined,
                      })}
                      className="cursor-pointer"
                    >
                      <Badge
                        variant={active ? "default" : "outline"}
                        className="text-[11px]"
                        size="sm"
                      >
                        {t.name}
                        {t._count?.products ? ` (${t._count.products})` : ""}
                      </Badge>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          <Button type="submit" size="sm" className="w-full">
            Apply
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

CategoryFilters.displayName = "CategoryFilters"