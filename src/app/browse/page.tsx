export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getTrendingProductIds } from "@/lib/trending"
import { ProductGrid } from "@/components/product-grid"
import { SearchBar } from "@/components/search-bar"
import { SortSelect } from "@/components/sort-select"
import {
  MarketplaceFilters,
  type CategoryOption,
  type TagOption,
} from "@/components/marketplace-filters"
import { EmptyBrowseState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const PAGE_SIZE = 24

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1"))
  const sort = searchParams.sort || "trending"

  const tagList = (searchParams.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
  const creatorQuery = searchParams.creator?.trim()
  const platformQuery = searchParams.platform?.trim()
  const ratingThreshold = searchParams.rating ? parseFloat(searchParams.rating) : null
  const validRatingThreshold =
    ratingThreshold !== null && !Number.isNaN(ratingThreshold) ? ratingThreshold : null

  const price: Record<string, number> = {}
  if (searchParams.priceMin) price.gte = parseFloat(searchParams.priceMin)
  if (searchParams.priceMax) price.lte = parseFloat(searchParams.priceMax)

  const where: any = {
    isPublished: true,
    status: "PUBLISHED",
    creator: {
      creatorStatus: "APPROVED",
      status: "ACTIVE",
      isInternal: false,
      store: { visibility: "PUBLISHED" },
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
    ...(tagList.length > 0 && { tags: { some: { tag: { slug: { in: tagList } } } } }),
  }

  const productInclude = {
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
    media: { where: { isThumbnail: true }, take: 1 },
    reviews: { select: { rating: true } },
    tags: { include: { tag: true } },
    _count: { select: { favorites: true, reviews: true, downloads: true } },
  }

  let products: any[] = []
  let total = 0
  let categories: CategoryOption[] = []
  let tags: TagOption[] = []

  try {
    // A minimum-rating filter has to be resolved to product ids first,
    // because the threshold applies to the average, not to a column.
    let countWhere: any = where
    if (validRatingThreshold !== null) {
      const ratedProductIds = (
        await prisma.review.groupBy({
          by: ["productId"],
          _avg: { rating: true },
          having: { rating: { _avg: { gte: validRatingThreshold } } },
        })
      ).map((review) => review.productId)
      countWhere = { ...where, id: { in: ratedProductIds } }
    }

    const [fetchedTotal, fetchedCategories, fetchedTags] = await Promise.all([
      prisma.product.count({ where: countWhere }),
      prisma.category.findMany({
        where: { parentId: null },
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      prisma.tag.findMany({
        orderBy: { products: { _count: "desc" } },
        take: 15,
        select: { id: true, name: true, slug: true },
      }),
    ])

    total = fetchedTotal
    categories = fetchedCategories
    tags = fetchedTags

    products = await queryProducts({ sort, where, countWhere, page, productInclude })
  } catch (error) {
    console.error("Browse page error:", error)
    return (
      <div className="pv-shell py-12">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Explore</h1>
        <p className="mt-2 text-text-secondary">
          We couldn&apos;t load products right now. Please try again.
        </p>
      </div>
    )
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const productsWithRating = products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
        : 0
    return {
      ...p,
      rating: avgRating,
      reviewCount: p.reviews.length,
      salesCount: p._count?.downloads ?? 0,
    }
  })

  return (
    <div className="pv-shell py-8 md:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-[32px]">
            Explore
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>
        <SortSelect current={sort} params={searchParams} />
      </div>

      <div className="mt-5 max-w-xl">
        <SearchBar />
      </div>

      <MarketplaceFilters
        categories={categories}
        tags={tags}
        className="mt-6 border-b border-border pb-5"
      />

      <div className="mt-6">
        <ProductGrid
          products={productsWithRating}
          emptyMessage={
            <EmptyBrowseState hasFilters={hasActiveFilters(searchParams)} query={searchParams.q} />
          }
        />
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} searchParams={searchParams} />
      )}
    </div>
  )
}

/**
 * Fetches one page of products.
 *
 * Trending cannot be expressed as a Prisma orderBy — it is a weighted
 * score across several relations — so that path ranks the whole matching
 * set by score and then slices the requested page.
 */
async function queryProducts({
  sort,
  where,
  countWhere,
  page,
  productInclude,
}: {
  sort: string
  where: any
  countWhere: any
  page: number
  productInclude: any
}) {
  if (sort === "trending") {
    const candidateIds = (
      await prisma.product.findMany({ where: countWhere, select: { id: true } })
    ).map((p) => p.id)

    if (candidateIds.length === 0) return []

    const rankedIds = await getTrendingProductIds(candidateIds.length, [], candidateIds)
    const start = (page - 1) * PAGE_SIZE
    const pageIds = rankedIds.slice(start, start + PAGE_SIZE)
    if (pageIds.length === 0) return []

    const products = await prisma.product.findMany({
      where: { id: { in: pageIds } },
      include: productInclude,
    })
    const order = new Map(pageIds.map((id, i) => [id, i]))
    return products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
  }

  return prisma.product.findMany({
    where,
    orderBy: browseOrderBy(sort),
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: productInclude,
  })
}

function browseOrderBy(sort: string): any {
  return (
    {
      newest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
      "price-asc": { price: "asc" },
      "price-desc": { price: "desc" },
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
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-3"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        asChild={page > 1}
      >
        {page > 1 ? (
          <Link href={buildHref(searchParams, { page: String(page - 1) })}>Previous</Link>
        ) : (
          <span>Previous</span>
        )}
      </Button>
      <span className="text-sm text-text-muted">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        asChild={page < totalPages}
      >
        {page < totalPages ? (
          <Link href={buildHref(searchParams, { page: String(page + 1) })}>Next</Link>
        ) : (
          <span>Next</span>
        )}
      </Button>
    </nav>
  )
}
