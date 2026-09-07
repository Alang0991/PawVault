export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { ProductGrid } from "@/components/product-grid"
import { CreatorCard } from "@/components/creator-card"
import { CategoryCard } from "@/components/category-card"
import { SectionHeader } from "@/components/section-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { SearchBar } from "@/components/search-bar"
import Link from "next/link"
import { Search } from "lucide-react"

async function searchProducts(query: string) {
  return prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
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
      media: {
        where: { isThumbnail: true },
        take: 1,
      },
      reviews: {
        select: { rating: true },
      },
      _count: {
        select: { favorites: true, reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

async function searchCreators(query: string) {
  return prisma.user.findMany({
    where: {
      role: { in: ["CREATOR", "VERIFIED_CREATOR"] },
      OR: [
        { displayName: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      followersCount: true,
      salesCount: true,
      isVerified: true,
      store: { select: { slug: true } },
      _count: {
        select: { products: { where: { isPublished: true } } },
      },
    },
  })
}

async function searchCategories(query: string) {
  return prisma.category.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { _count: { select: { products: { where: { isPublished: true } } } } },
  })
}

function enrich(products: any[]) {
  return products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
        : 0
    return { ...p, rating: avgRating, reviewCount: p.reviews.length }
  })
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; tab?: string }
}) {
  const query = (searchParams.q || "").trim()
  let products: any[] = []
  let creators: any[] = []
  let categories: any[] = []

  if (query.length > 0) {
    try {
      const [p, c, cat] = await Promise.all([
        searchProducts(query),
        searchCreators(query),
        searchCategories(query),
      ])
      products = enrich(p)
      creators = c
      categories = cat
    } catch (error) {
      console.error("Search page error:", error)
    }
  }

  const totalResults = products.length + creators.length + categories.length
  const defaultTab =
    searchParams.tab ||
    (products.length > 0 ? "products" : creators.length > 0 ? "creators" : "categories")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <SectionHeader
          title="Search"
          subtitle={
            query
              ? `${totalResults} result${totalResults === 1 ? "" : "s"} for "${query}"`
              : "Find products, creators, and categories"
          }
        />

        <div className="mt-4 max-w-xl">
          <SearchBar />
        </div>

        {!query && (
          <div className="text-center py-16">
            <div className="mx-auto h-10 w-10 rounded-full bg-surface-subtle flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary">
              Enter a search term to find products, creators, and categories.
            </p>
          </div>
        )}

        {query && totalResults === 0 && (
          <div className="text-center py-16">
            <p className="font-semibold text-text-primary mb-1">
              Nothing matched that search.
            </p>
            <p className="text-sm text-text-secondary mb-4">
              Try different keywords or explore what PawVault has to offer.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button asChild size="sm">
                <Link href="/browse">Browse all products</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/categories">Explore categories</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/creators">Explore creators</Link>
              </Button>
            </div>
          </div>
        )}

        {query && totalResults > 0 && (
          <Tabs defaultValue={defaultTab} className="mt-2">
            <TabsList>
              <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="creators">Creators ({creators.length})</TabsTrigger>
              <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <ProductGrid products={products} />
            </TabsContent>

            <TabsContent value="creators" className="mt-6">
              {creators.length === 0 ? (
                <p className="text-center text-text-muted py-12">No creators found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {creators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
              {categories.length === 0 ? (
                <p className="text-center text-text-muted py-12">No categories found.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
