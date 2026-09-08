export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { ProductGrid } from "@/components/product-grid"
import { SectionHeader } from "@/components/section-header"
import { SearchBar } from "@/components/search-bar"
import { SortSelect } from "@/components/sort-select"
import { CategoryFilters } from "@/components/category-filters"
import { EmptyBrowseState } from "@/components/empty-state"
import { Pagination } from "@/components/pagination"
import { BrowseSkeleton } from "@/components/browse-skeleton"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, seoTitle: true, seoDescription: true, parent: { select: { name: true, slug: true } } },
  })

  if (!category) {
    return { title: "Category Not Found" }
  }

  const title = category.seoTitle || `${category.name} | PawVault`
  const description = category.seoDescription || category.description || `Browse ${category.name} on PawVault.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  }
}

const PAGE_SIZE = 24

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
    searchParams.priceMin ||
      searchParams.priceMax ||
      searchParams.rating ||
      searchParams.tags ||
      searchParams.free ||
      searchParams.onSale
  )
}

async function CategoryContent({ slug, searchParams }: { slug: string; searchParams: any }) {
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const page = Math.max(1, parseInt(searchParams.page || "1"))
  const tagList = searchParams.tags
    ? searchParams.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : []

  const price: any = {}
  if (searchParams.priceMin) price.gte = parseFloat(searchParams.priceMin)
  if (searchParams.priceMax) price.lte = parseFloat(searchParams.priceMax)

  const where: any = {
    isPublished: true,
    categoryId: category.id,
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

  const [products, total, subcategories, popularTags] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: browseOrderBy(searchParams.sort || "newest"),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
        media: { where: { isThumbnail: true }, take: 1 },
        reviews: { select: { rating: true } },
        tags: { include: { tag: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
    }),
    searchParams.rating
      ? prisma.product.count({
          where: {
            ...where,
            id: {
              in: await prisma.review
                .groupBy({
                  by: ["productId"],
                  _avg: { rating: true },
                  having: { rating: { _avg: { gte: parseFloat(searchParams.rating) } } },
                })
                .then((r) => r.map((x) => x.productId)),
            },
          },
        })
      : prisma.product.count({ where }),
    prisma.category.findMany({
      where: { parentId: category.id },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { products: { _count: "desc" } },
      take: 15,
    }),
  ])

  const productsWithRating = products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
        : 0
    return { ...p, rating: avgRating, reviewCount: p.reviews.length }
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <Link href="/categories" className="hover:text-accent">Categories</Link>
            <span>/</span>
            <span className="text-text-primary">{category.name}</span>
          </div>
          <SectionHeader
            title={category.name}
            subtitle={`${total} product${total === 1 ? "" : "s"} found`}
          />
          {category.description && (
            <p className="text-sm text-text-secondary mt-2 max-w-2xl">
              {category.description}
            </p>
          )}
          <div className="mt-4 max-w-xl">
            <SearchBar />
          </div>
        </div>

        {subcategories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-text-secondary mb-3">Subcategories</h3>
            <div className="flex flex-wrap gap-2">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.slug}`}
                  className="px-3 py-1.5 rounded-full border border-border text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors"
                >
                  {sub.name} ({sub._count.products})
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="lg:col-span-1">
            <CategoryFilters
              categories={[category]}
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
              emptyMessage={<EmptyBrowseState hasFilters={hasActiveFilters(searchParams)} />}
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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: {
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
  return (
    <Suspense fallback={<BrowseSkeleton />}>
      <CategoryContent slug={params.slug} searchParams={searchParams} />
    </Suspense>
  )
}