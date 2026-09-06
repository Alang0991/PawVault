export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/helpers"
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

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; tab?: string } }) {
  const query = searchParams.q || ""
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
      products = p
      creators = c
      categories = cat
    } catch (error) {
      console.error("Search page error:", error)
    }
  }

  const totalResults = products.length + creators.length + categories.length
  const defaultTab = searchParams.tab || (products.length > 0 ? "products" : creators.length > 0 ? "creators" : "categories")

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">
          {query ? `Results for "${query}"` : "Search"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {query ? `${totalResults} result${totalResults === 1 ? "" : "s"}` : "Find products, creators, and categories."}
        </p>

        {query.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-10 w-10 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Enter a search term to find products, creators, and categories.</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-16">
            <p className="font-semibold mb-1">Nothing matched that search.</p>
            <p className="text-sm text-muted-foreground mb-4">Try different keywords or explore what PawVault has to offer.</p>
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
        ) : (
          <Tabs defaultValue={defaultTab}>
            <TabsList>
              <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="creators">Creators ({creators.length})</TabsTrigger>
              <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-6">
              {products.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No products found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => {
                     const avgRating = product.reviews.length > 0
                       ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
                       : 0

                    return (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product,
                          rating: avgRating,
                          reviewCount: product.reviews.length,
                        }}
                      />
                    )
                  })}
                </div>
              )}
            </TabsContent>
            <TabsContent value="creators" className="mt-6">
              {creators.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No creators found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {creators.map((creator) => (
                    <Link key={creator.id} href={`/store/${creator.username}`}>
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 p-5">
                          <Avatar className="h-11 w-11">
                            <AvatarImage src={creator.avatar || ""} alt={creator.displayName || creator.username} />
                            <AvatarFallback>{(creator.displayName || creator.username)[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{creator.displayName || creator.username}</h3>
                            {creator.bio && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{creator.bio}</p>
                            )}
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                              <span>{creator.followersCount} followers</span>
                              <span>·</span>
                              <span>{creator.salesCount} sales</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="categories" className="mt-6">
              {categories.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No categories found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.slug}`}>
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-sm">{category.name}</h3>
                            <p className="text-xs text-muted-foreground">{category._count.products} product{category._count.products === 1 ? "" : "s"}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
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
