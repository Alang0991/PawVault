import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ShoppingCart, Heart } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function BrowsePage() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    include: {
      creator: true,
      media: {
        where: { isThumbnail: true },
        take: 1
      },
      reviews: {
        take: 5
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Browse Products</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing digital products from talented creators
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link key={category.id} href={`/browse?category=${category.slug}`}>
                <Badge variant="outline" className="hover:bg-purple-100 dark:hover:bg-purple-900/20 cursor-pointer">
                  {category.name} ({category._count.products})
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const avgRating = product.reviews.length > 0
              ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
              : 0

            return (
              <Card key={product.id} className="hover:shadow-lg transition-all hover:-translate-y-1 group">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                    {product.media[0] ? (
                      <img
                        src={product.media[0].url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{product.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {product.description || "No description"}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={product.creator.avatar || undefined} />
                      <AvatarFallback>
                        {product.creator.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {product.creator.displayName || product.creator.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({product.reviews.length})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {product.isOnSale && product.salePrice ? (
                        <>
                          <span className="text-lg font-bold text-purple-600">
                            ${product.salePrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.price.toFixed(2)}
                          </span>
                        </>
                      ) : product.isFree ? (
                        <span className="text-lg font-bold text-green-600">Free</span>
                      ) : (
                        <span className="text-lg font-bold">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Link href={`/products/${product.slug}`}>
                      <Button size="sm" className="gradient-bg text-white">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No products found</p>
          </div>
        )}
      </div>
    </div>
  )
}
