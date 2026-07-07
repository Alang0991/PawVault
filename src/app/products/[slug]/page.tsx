import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ShoppingCart, Heart, Download, Share2 } from "lucide-react"
import Link from "next/link"
import { getServerUser } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      creator: true,
      media: {
        orderBy: { order: "asc" }
      },
      files: true,
      reviews: {
        include: {
          user: true
        },
        orderBy: { createdAt: "desc" }
      },
      category: true
    }
  })

  if (!product) {
    notFound()
  }

  const user = await getServerUser()
  const isCreator = user?.id === product.creatorId
  const hasPurchased = user ? await prisma.order.findFirst({
    where: {
      buyerId: user.id,
      status: "COMPLETED",
      items: { some: { productId: product.id } },
    },
  }) : null
  const canDownload = isCreator || !!hasPurchased

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
              {product.media[0] ? (
                <img
                  src={product.media[0].url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.media.slice(1, 5).map((media) => (
                <div key={media.id} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                  <img
                    src={media.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              by {product.creator.displayName || product.creator.username}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < avgRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {avgRating.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold">
                {product.isFree ? "Free" : `$${product.price.toFixed(2)}`}
              </span>
              {product.isOnSale && product.salePrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.salePrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex gap-4 mb-6">
              <Button size="lg" className="flex-1 gradient-bg text-white">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {product.files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Included Files</h3>
                <div className="space-y-2">
                  {product.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{file.filename}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        {canDownload ? (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/api/products/files/${file.id}/download`}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Purchase to download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.unityVersion && (
              <div className="flex gap-4 mt-6">
                <Badge variant="outline">Unity {product.unityVersion}</Badge>
                {product.vrcSdkVersion && (
                  <Badge variant="outline">VRChat SDK {product.vrcSdkVersion}</Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reviews ({product.reviews.length})</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={review.user.avatar || undefined} />
                      <AvatarFallback>
                        {review.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {review.user.displayName || review.user.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}
                  <p className="text-gray-600 dark:text-gray-400">{review.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {product.reviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
