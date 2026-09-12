export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { BundleCard } from "@/components/bundle-card"
import { SectionHeader } from "@/components/section-header"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const PAGE_SIZE = 12

export default async function BundlesPage({
  searchParams,
}: {
  searchParams: {
    q?: string
    sort?: string
    page?: string
  }
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1"))
  const q = (searchParams.q || "").trim()

  const where: any = {
    isPublished: true,
    creator: {
      creatorStatus: "APPROVED",
      status: "ACTIVE",
      isInternal: false,
      store: { visibility: "PUBLISHED" },
    },
    items: {
      some: {
        product: { isPublished: true, status: "PUBLISHED" },
      },
    },
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }

  const orderBy: any = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    "price-asc": { price: "asc" },
    "price-desc": { price: "desc" },
    popular: { items: { _count: "desc" } },
  }[searchParams.sort || "newest"] || { createdAt: "desc" }

  let bundles: any[] = []
  let total = 0

  try {
    const [fetchedBundles, fetchedTotal] = await Promise.all([
      prisma.bundle.findMany({
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
              isVerified: true,
            },
          },
          store: { select: { id: true, name: true, slug: true, visibility: true } },
          items: {
            orderBy: { order: "asc" },
            take: 6,
            include: {
              product: {
                include: {
                  media: { where: { isThumbnail: true }, take: 1 },
                  creator: {
                    select: {
                      id: true,
                      username: true,
                      displayName: true,
                      avatar: true,
                      isVerified: true,
                    },
                  },
                  reviews: { select: { rating: true } },
                  _count: { select: { reviews: true, favorites: true } },
                },
              },
            },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.bundle.count({ where }),
    ])

    bundles = fetchedBundles.map((b: any) => enrichBundle(b))
    total = fetchedTotal
  } catch (error) {
    console.error("Bundles page error:", error)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <SectionHeader
            title="Bundles"
            subtitle={`${total} bundle${total === 1 ? "" : "s"} available`}
          />
          <p className="text-sm text-text-secondary max-w-2xl mt-2">
            Curated collections of products bundled together at a discounted
            price. Buy once and get everything in the bundle.
          </p>
          <div className="mt-6 max-w-xl">
            <SearchBar />
          </div>
        </div>

        {bundles.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold mb-1 text-text-primary">
              {q ? "No bundles match your search" : "No bundles yet"}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {q
                ? "Try a different search term."
                : "Creators can bundle their products together here soon."}
            </p>
            {q && (
              <Button asChild variant="outline" size="sm">
                <Link href="/bundles">Clear search</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bundles.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                searchParams={searchParams}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function enrichBundle(bundle: any) {
  const totalValue = bundle.items.reduce(
    (sum: number, item: any) => {
      const p = item.product
      const effectivePrice = p.isOnSale && p.salePrice != null ? p.salePrice : p.price
      return sum + effectivePrice
    },
    0
  )
  const savings = Math.max(0, totalValue - bundle.price)
  return {
    ...bundle,
    totalValue,
    savings,
    savingsPercent: totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0,
    itemCount: bundle._count?.items ?? bundle.items?.length ?? 0,
  }
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
  return qs ? `/bundles?${qs}` : "/bundles"
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
      <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
        {page > 1 ? (
          <Link href={buildHref(searchParams, { page: String(page - 1) })}>Previous</Link>
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
          <Link href={buildHref(searchParams, { page: String(page + 1) })}>Next</Link>
        ) : (
          <span>Next</span>
        )}
      </Button>
    </div>
  )
}
