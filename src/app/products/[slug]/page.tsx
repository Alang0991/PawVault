import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ShoppingCart, Heart, Download, Share2 } from "lucide-react"
import Link from "next/link"
import { getServerUser } from "@/lib/session"
import { ProductGallery } from "./product-gallery"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, isPublished: true, status: "PUBLISHED" },
    select: { title: true, description: true, creator: { select: { username: true, displayName: true } } },
  })

  if (!product) return { title: "Product Not Found | PawVault" }

  const creatorName = product.creator.displayName || product.creator.username
  const description = product.description || `${product.title} by ${creatorName} on PawVault.`

  return {
    title: `${product.title} | PawVault`,
    description: description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: description.slice(0, 160),
      type: "website",
      url: `https://pawvault.com/products/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: description.slice(0, 160),
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let product
  try {
    product = await prisma.product.findUnique({
      where: { slug: params.slug },
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
          orderBy: { order: "asc" }
        },
        files: {
          select: {
            id: true,
            filename: true,
            size: true,
            platform: true,
            version: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      }
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">We couldn't load this product. Please try again later.</p>
            <Button asChild>
              <Link href="/browse">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const user = await getServerUser()
  const isOwner = user?.id === product.creatorId
  const isStaff = ["ADMIN", "FOUNDER", "MODERATOR"].includes(user?.role || "")
  const isVisible = product.status === "PUBLISHED" && product.isPublished

  if (!isVisible && !isOwner && !isStaff) {
    notFound()
  }

  const hasPurchased = user ? await prisma.order.findFirst({
    where: {
      buyerId: user.id,
      status: "COMPLETED",
      items: { some: { productId: product.id } },
    },
  }) : null
  const canDownload = isOwner || isStaff || !!hasPurchased

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductGallery media={product.media} contentRating={product.contentRating} />
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
              <Button size="lg" className="flex-1 gradient-bg text-white" aria-label="Add to cart">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" aria-label="Add to wishlist">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" aria-label="Share product">
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
                             <a href={`/api/products/files/${file.id}/download`} aria-label={`Download ${file.filename}`}>
                               <Download className="h-4 w-4 mr-1" />
                               Download
                             </a>
                           </Button>
                         ) : (
                           <Button size="sm" variant="outline" disabled aria-label="Purchase to download">
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
                      <AvatarImage src={review.user.avatar || undefined} alt={review.user.displayName || review.user.username} />
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
