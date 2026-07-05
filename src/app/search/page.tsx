export const dynamic = "force-dynamic"

import { prisma } from "@/lib/db"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/helpers"
import Link from "next/link"
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
        select: { favorites: true },
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

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || ""
  const [products, creators] = query.length > 0 ? await Promise.all([
    searchProducts(query),
    searchCreators(query),
  ]) : [[], []]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {products.length + creators.length} results found
        </p>

        {query.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Enter a search term to find products and creators.</p>
        ) : (
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="creators">Creators ({creators.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-6">
              {products.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No products found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => {
                    const avgRating = product.reviews.length > 0
                      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
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
                    <Link key={creator.id} href={`/store/${creator.id}`}>
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 p-6">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={creator.avatar || ""} alt={creator.displayName || creator.username} />
                            <AvatarFallback>{(creator.displayName || creator.username)[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{creator.displayName || creator.username}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{creator.bio}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
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
          </Tabs>
        )}
      </div>
    </div>
  )
}
