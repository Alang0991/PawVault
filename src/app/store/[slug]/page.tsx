export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RatingStars } from "@/components/rating-stars"
import { Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getShop(slug: string) {
  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          followersCount: true,
        },
      },
      products: {
        where: { isPublished: true },
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
      },
    },
  })

  if (!store) {
    notFound()
  }

  const storeRating = store.products.length > 0
    ? store.products.reduce((acc, p) => {
        const productRating = p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0
        return acc + productRating
      }, 0) / store.products.filter(p => p.reviews.length > 0).length || 0
    : 0

  return { ...store, rating: storeRating || 0 }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const store = await getShop(params.slug)
  return {
    title: `${store.name} - Shop`,
    description: store.description || `Assets from ${store.name}`,
  }
}

export default async function ShopPage({ params }: { params: { slug: string } }) {
  const store = await getShop(params.slug)
  const creatorName = store.user.displayName || store.user.username

  return (
    <div className="min-h-screen">
      <div className="h-64 bg-gradient-to-br from-gray-900 to-gray-700 relative">
        {store.banner && (
          <img src={store.banner} alt={store.name} className="w-full h-full object-cover opacity-50" />
        )}
      </div>
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-8">
          <div className="flex items-end gap-6">
            <Avatar className="h-32 w-32 border-4 border-white bg-white">
              <AvatarImage src={store.user.avatar || ""} alt={creatorName} />
              <AvatarFallback className="text-4xl">{creatorName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 py-4">
              <h1 className="text-3xl font-bold">{store.name}</h1>
              <p className="text-muted-foreground mt-1">{store.description || `Assets by ${creatorName}`}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <RatingStars rating={store.rating} />
                  {store.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {store.user.followersCount} followers
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button>Follow</Button>
              <Button variant="outline">Message</Button>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        <Tabs defaultValue="assets">
          <TabsList>
            <TabsTrigger value="products">Products ({store.products.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6">
            {store.products.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No products yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {store.products.map((product) => {
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
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About {creatorName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{store.user.bio || "This creator has not added a bio yet."}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
