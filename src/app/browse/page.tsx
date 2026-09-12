export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { ProductGrid } from "@/components/product-grid"
import { SectionHeader } from "@/components/section-header"
import { SearchBar } from "@/components/search-bar"
import { SortSelect } from "@/components/sort-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const PAGE_SIZE = 24

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: {
    category?: string
    priceMin?: string
    priceMax?: string
    rating?: string
    tags?: string
    free?: string
    onSale?: string
    sort?: string
    page?: string
    q?: string
    featured?: string
    creator?: string
    pc?: string
    quest?: string
    platform?: string
  }
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1"))
  const tagList = searchParams.tags
    ? searchParams.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : []
  const creatorQuery = searchParams.creator?.trim()
  const platformQuery = searchParams.platform?.trim()
  const ratingThreshold = searchParams.rating
    ? parseFloat(searchParams.rating)
    : null
  const validRatingThreshold =
    ratingThreshold !== null && !Number.isNaN(ratingThreshold)
      ? ratingThreshold
      : null

  const price: any = {}
  if (searchParams.priceMin) price.gte = parseFloat(searchParams.priceMin)
  if (searchParams.priceMax) price.lte = parseFloat(searchParams.priceMax)

  const where: any = {
    isPublished: true,
    status: "PUBLISHED",
    creator: {
      creatorStatus: "APPROVED",
      status: "ACTIVE",
      isInternal: false,
      store: {
        visibility: "PUBLISHED",
      },
      ...(creatorQuery && {
        OR: [
          { username: { contains: creatorQuery, mode: "insensitive" } },
          { displayName: { contains: creatorQuery, mode: "insensitive" } },
        ],
      }),
    },
    ...(searchParams.featured === "true" && { isFeatured: true }),
    ...(searchParams.category && { category: { slug: searchParams.category } }),
    ...(searchParams.free === "true" && { isFree: true }),
    ...(searchParams.onSale === "true" && { isOnSale: true }),
    ...(searchParams.pc === "true" && { pcCompatible: true }),
    ...(searchParams.quest === "true" && { questCompatible: true }),
    ...(platformQuery && {
      files: { some: { platform: { contains: platformQuery, mode: "insensitive" } } },
    }),
    ...(searchParams.q && {
      OR: [
        { title: { contains: searchParams.q, mode: "insensitive" } },
        { description: { contains: searchParams.q, mode: "insensitive" } },
      ],
    }),
    ...(Object.keys(price).length > 0 && { price }),
    ...(tagList.length > 0 && {
      tags: { some: { tag: { slug: { in: tagList } } } },
    }),
  }

  let products: any[] = []
  let total = 0
  let categories: any[] = []
  let popularTags: any[] = []

  let countWhere: any = where

  try {
    if (validRatingThreshold !== null) {
      const ratedProductIds = (
        await prisma.review.groupBy({
          by: ["productId"],
          _avg: { rating: true },
          having: {
            rating: { _avg: { gte: validRatingThreshold } },
          },
        })
      ).map((review) => review.productId)
      countWhere = { ...where, id: { in: ratedProductIds } }
    }

    const [fetchedProducts, fetchedTotal, fetchedCategories, fetchedTags] =
      await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: browseOrderBy(searchParams.sort || "newest"),
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                isVerified: true,
              },
            },
            category: true,
            media: {
              where: { isThumbnail: true },
              take: 1,
            },
            reviews: { select: { rating: true } },
            tags: { include: { tag: true } },
            _count: { select: { favorites: true, reviews: true } },
          },
        }),
        prisma.product.count({ where: countWhere }),
        prisma.category.findMany({
          include: { _count: { select: { products: true } } },
          orderBy: { name: "asc" },
        }),
        prisma.tag.findMany({
          include: { _count: { select: { products: true } } },
          orderBy: { products: { _count: "desc" } },
          take: 15,
        }),
      ])

    products = fetchedProducts
    total = fetchedTotal
    categories = fetchedCategories
    popularTags = fetchedTags
  } catch (error) {
    console.error("Browse page error:", error)
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-2 text-text-primary">
            Browse Products
          </h1>
          <p className="text-text-secondary">
            Unable to load products. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const productsWithRating = products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
        : 0
    return { ...p, rating: avgRating, reviewCount: p.reviews.length }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <SectionHeader
            title="Browse Marketplace"
            subtitle={`${total} product${total === 1 ? "" : "s"} found`}
          />
          <div className="mt-4 max-w-xl">
            <SearchBar />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="lg:col-span-1">
            <FiltersCard
              categories={categories}
              popularTags={popularTags}
              searchParams={searchParams}
              tagList={tagList}
            />
          </aside>

          <div>
            <div className="flex items-center justify-between mb-4">
              <SortSelect
                current={searchParams.sort || "newest"}
                params={searchParams}
              />
            </div>

            <ProductGrid
              products={productsWithRating}
              emptyMessage={
                <EmptyBrowseState hasFilters={hasActiveFilters(searchParams)} />
              }
            />

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                searchParams={searchParams}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function browseOrderBy(sort: string): any {
  return (
    {
      newest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
      "price-asc": { price: "asc" },
      "price-desc": { price: "desc" },
      popular: { favorites: { _count: "desc" } },
      rating: { reviews: { _count: "desc" } },
    }[sort] || { createdAt: "desc" }
  )
}

function hasActiveFilters(searchParams: Record<string, string | undefined>) {
  return Boolean(
    searchParams.category ||
      searchParams.priceMin ||
      searchParams.priceMax ||
      searchParams.rating ||
      searchParams.tags ||
      searchParams.free ||
      searchParams.onSale ||
      searchParams.creator ||
      searchParams.pc ||
      searchParams.quest ||
      searchParams.platform
  )
}

function buildHref(
  searchParams: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
) {
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

function FiltersCard({
  categories,
  popularTags,
  searchParams,
  tagList,
}: {
  categories: any[]
  popularTags: any[]
  searchParams: Record<string, string | undefined>
  tagList: string[]
}) {
  const activeFilters = hasActiveFilters(searchParams)

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-sm">Filters</CardTitle>
        {activeFilters && (
          <Link href="/browse" className="text-xs text-sale hover:underline">
            Clear
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4">
          <input type="hidden" name="sort" value={searchParams.sort || "newest"} />

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted">Search</Label>
            <Input
              name="q"
              defaultValue={searchParams.q || ""}
              placeholder="Search products..."
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted">Creator</Label>
            <Input
              name="creator"
              defaultValue={searchParams.creator || ""}
              placeholder="Creator name or username"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted">Category</Label>
            <select
              name="category"
              defaultValue={searchParams.category || ""}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-text-primary"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted">Price</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                name="priceMin"
                placeholder="Min"
                defaultValue={searchParams.priceMin || ""}
                className="text-xs"
              />
              <span className="text-text-muted">-</span>
              <Input
                type="number"
                name="priceMax"
                placeholder="Max"
                defaultValue={searchParams.priceMax || ""}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted">Min rating</Label>
            <select
              name="rating"
              defaultValue={searchParams.rating || ""}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-text-primary"
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
                name="pc"
                value="true"
                defaultChecked={searchParams.pc === "true"}
                className="accent-accent"
              />
              PC
            </label>
            <label className="flex items-center gap-1.5 text-xs text-text-secondary">
              <input
                type="checkbox"
                name="quest"
                value="true"
                defaultChecked={searchParams.quest === "true"}
                className="accent-accent"
              />
              Quest
            </label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-text-muted">Platform</Label>
            <Input
              name="platform"
              defaultValue={searchParams.platform || ""}
              placeholder="Windows, macOS, Blender..."
              className="text-xs"
            />
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
              <Label className="text-xs text-text-muted">Tags</Label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {popularTags.map((t) => {
                  const active = tagList.includes(t.slug)
                  return (
                    <label key={t.id} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="tags"
                        value={t.slug}
                        defaultChecked={active}
                        className="sr-only"
                      />
                      <Badge
                        variant={active ? "default" : "outline"}
                        className="text-[11px]"
                        size="sm"
                      >
                        {t.name}
                      </Badge>
                    </label>
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

function EmptyBrowseState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-16">
      <h3 className="text-lg font-semibold mb-1 text-text-primary">
        {hasFilters
          ? "No products match your filters"
          : "No products yet"}
      </h3>
      <p className="text-sm text-text-secondary mb-4">
        {hasFilters
          ? "Try adjusting or clearing your filters."
          : "More drops are on the way. Check back soon."}
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href={hasFilters ? "/browse" : "/creator/dashboard"}>
          {hasFilters ? "Clear filters" : "Start selling"}
        </Link>
      </Button>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        asChild={page > 1}
      >
        {page > 1 ? (
          <Link href={buildHref(searchParams, { page: String(page - 1) })}>
            Previous
          </Link>
        ) : (
          <span>Previous</span>
        )}
      </Button>
      <span className="text-xs text-text-muted px-2">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        asChild={page < totalPages}
      >
        {page < totalPages ? (
          <Link href={buildHref(searchParams, { page: String(page + 1) })}>
            Next
          </Link>
        ) : (
          <span>Next</span>
        )}
      </Button>
    </div>
  )
}
