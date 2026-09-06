import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { SortSelect } from "@/components/sort-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const dynamic = "force-dynamic"

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
  }
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1"))
  const tagList = searchParams.tags
    ? searchParams.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  const price: any = {}
  if (searchParams.priceMin) price.gte = parseFloat(searchParams.priceMin)
  if (searchParams.priceMax) price.lte = parseFloat(searchParams.priceMax)

  const where: any = {
    isPublished: true,
    ...(searchParams.category && { category: { slug: searchParams.category } }),
    ...(searchParams.free === "true" && { isFree: true }),
    ...(searchParams.onSale === "true" && { isOnSale: true }),
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

  if (searchParams.rating) {
    const min = parseFloat(searchParams.rating)
    const rated = await prisma.review.groupBy({
      by: ["productId"],
      _avg: { rating: true },
      having: { rating: { _avg: { gte: min } } },
    })
    where.id = { in: rated.map((r) => r.productId) }
  }

  const orderBy: any =
    {
      newest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
      "price-asc": { price: "asc" },
      "price-desc": { price: "desc" },
      popular: { favorites: { _count: "desc" } },
      "best-selling": { favorites: { _count: "desc" } },
      rating: { reviews: { _count: "desc" } },
    }[searchParams.sort || "newest"] || { createdAt: "desc" }

  let products: any[] = []
  let total = 0
  let categories: any[] = []
  let popularTags: any[] = []

  try {
    products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
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
    })
    total = await prisma.product.count({ where })
    categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    })
    popularTags = await prisma.tag.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { products: { _count: "desc" } },
      take: 15,
    })
  } catch (error) {
    console.error("Browse page error:", error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">Browse Products</h1>
          <p className="text-muted-foreground">Unable to load products. Please try again later.</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const productsWithRating = products.map((p) => ({
    ...p,
    rating:
      p.reviews.length > 0
        ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length
        : 0,
    reviewCount: p.reviews.length,
  }))

  const params = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v)
  )
  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) next.delete(k)
      else next.set(k, v)
    }
    const qs = next.toString()
    return qs ? `/browse?${qs}` : "/browse"
  }

  const hasFilters =
    searchParams.category ||
    searchParams.priceMin ||
    searchParams.priceMax ||
    searchParams.rating ||
    searchParams.tags ||
    searchParams.free ||
    searchParams.onSale

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Browse Marketplace</h1>
            <p className="text-sm text-muted-foreground">
              {total} product{total === 1 ? "" : "s"} found
            </p>
          </div>
          <SortSelect current={searchParams.sort || "newest"} params={searchParams} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm">Filters</CardTitle>
                {hasFilters && (
                  <Link href="/browse" className="text-xs text-rose-600 hover:underline">
                    Clear
                  </Link>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <form className="space-y-4">
                  <input type="hidden" name="sort" value={searchParams.sort || "newest"} />

                  <div className="space-y-1.5">
                    <Label className="text-xs">Search</Label>
                    <Input
                      name="q"
                      defaultValue={searchParams.q || ""}
                      placeholder="Search products..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Category</Label>
                    <select
                      name="category"
                      defaultValue={searchParams.category || ""}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
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
                    <Label className="text-xs">Price</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        name="priceMin"
                        placeholder="Min"
                        defaultValue={searchParams.priceMin || ""}
                        className="text-xs"
                      />
                      <span className="text-muted-foreground">-</span>
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
                    <Label className="text-xs">Min rating</Label>
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
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        name="free"
                        value="true"
                        defaultChecked={searchParams.free === "true"}
                      />
                      Free
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        name="onSale"
                        value="true"
                        defaultChecked={searchParams.onSale === "true"}
                      />
                      On sale
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Tags</Label>
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
                            >
                              {t.name}
                            </Badge>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <Button type="submit" size="sm" className="w-full">
                    Apply
                  </Button>
                </form>
              </CardContent>
            </Card>
          </aside>

          <div className="lg:col-span-3">
            {productsWithRating.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {productsWithRating.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border rounded-lg">
                <h3 className="text-lg font-semibold mb-1">No products match your filters</h3>
                <p className="text-sm text-muted-foreground mb-4">More drops are on the way.</p>
                {hasFilters ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/browse">Clear filters</Link>
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Link href="/creator/dashboard">Start selling</Link>
                  </Button>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  asChild={page > 1}
                >
                  {page > 1 ? (
                    <Link href={buildHref({ page: String(page - 1) })}>Previous</Link>
                  ) : (
                    <span>Previous</span>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  asChild={page < totalPages}
                >
                  {page < totalPages ? (
                    <Link href={buildHref({ page: String(page + 1) })}>Next</Link>
                  ) : (
                    <span>Next</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
