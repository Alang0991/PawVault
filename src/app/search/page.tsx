export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { ProductGrid } from "@/components/product-grid"
import { SectionHeader } from "@/components/section-header"
import { SearchBar } from "@/components/search-bar"
import { EmptyBrowseState } from "@/components/empty-state"
import { BrowseSkeleton } from "@/components/browse-skeleton"
import { Suspense } from "react"
import { CreatorGrid } from "@/components/creator-grid"
import { CategoryGrid } from "@/components/category-grid"

const PAGE_SIZE = 24

async function SearchContent({ q, type }: { q: string; type: string }) {
  const [products, creators, categories, tags] = await Promise.all([
    prisma.product.findMany({
      where: {
        isPublished: true,
        creator: { isInternal: false },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { subtitle: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatar: true } },
        media: { where: { isThumbnail: true }, take: 1 },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["CREATOR", "VERIFIED_CREATOR"] },
        creatorStatus: "APPROVED",
        status: "ACTIVE",
        isInternal: false,
        store: { visibility: "PUBLISHED" },
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true, username: true, displayName: true, avatar: true, bio: true,
        salesCount: true, rating: true, isVerified: true,
        store: { select: { name: true, slug: true, banner: true } },
        _count: { select: { products: { where: { isPublished: true } } } },
      },
      orderBy: { salesCount: "desc" },
      take: 12,
    }),
    prisma.category.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
      take: 8,
    }),
    prisma.tag.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
        products: {
          some: {
            product: {
              isPublished: true,
              creator: { isInternal: false },
            },
          },
        },
      },
      include: { _count: { select: { products: true } } },
      take: 12,
    }),
  ])

  const productsWithRating = products.map((p) => {
    const avgRating = p.reviews.length > 0
      ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
      : 0
    return { ...p, rating: avgRating, reviewCount: p.reviews.length }
  })

  const hasResults = productsWithRating.length > 0 || creators.length > 0 || categories.length > 0 || tags.length > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <SectionHeader
            title="Search Results"
            subtitle={`Results for "${q}"`}
          />
          <div className="mt-4 max-w-xl">
            <SearchBar />
          </div>
        </div>

        {!hasResults ? (
          <EmptyBrowseState hasFilters={false} query={q} />
        ) : (
          <div className="space-y-12">
            {productsWithRating.length > 0 && (
              <section>
                <SectionHeader
                  title="Products"
                  subtitle={`${productsWithRating.length} product${productsWithRating.length === 1 ? "" : "s"}`}
                />
                <ProductGrid products={productsWithRating} />
              </section>
            )}

            {creators.length > 0 && (
              <section>
                <SectionHeader
                  title="Creators"
                  subtitle={`${creators.length} creator${creators.length === 1 ? "" : "s"}`}
                />
                <CreatorGrid creators={creators} />
              </section>
            )}

            {categories.length > 0 && (
              <section>
                <SectionHeader title="Categories" />
                <CategoryGrid categories={categories} />
              </section>
            )}

            {tags.length > 0 && (
              <section>
                <SectionHeader title="Tags" />
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <a
                      key={t.id}
                      href={`/browse?tags=${t.slug}`}
                      className="px-3 py-1.5 rounded-full border border-border text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors"
                    >
                      {t.name} ({t._count.products})
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string }
}) {
  const q = searchParams.q || ""
  const type = searchParams.type || "all"

  if (!q) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<BrowseSkeleton />}>
      <SearchContent q={q} type={type} />
    </Suspense>
  )
}