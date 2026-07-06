export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/helpers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Star, ShoppingCart, Heart, Download, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        },
      },
      category: true,
      media: {
        orderBy: { order: "asc" },
      },
      files: true,
      tags: {
        include: {
          tag: true,
        },
      },
      reviews: {
        where: { isVerified: true },
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
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!product) {
    notFound()
  }

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0

  return { ...product, rating: avgRating }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  return {
    title: product.title,
    description: product.description || `Buy ${product.title} on Furmarket`,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  const creatorName = product.creator.displayName || product.creator.username

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="aspect-video bg-muted relative overflow-hidden rounded-lg">
              {product.media[0] ? (
                <img src={product.media[0].url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            {product.media.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.media.slice(1, 5).map((media, index) => (
                  <div key={media.id} className="aspect-video bg-muted relative overflow-hidden rounded">
                    <img src={media.url} alt={`${product.title} ${index + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.isOnSale && product.salePrice && (
                  <Badge className="bg-red-500 text-white">Sale</Badge>
                )}
                {product.isFree && (
                  <Badge className="bg-green-500 text-white">Free</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              {product.subtitle && (
                <p className="text-muted-foreground mt-1">{product.subtitle}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-sky-500 fill-current" />
                  <span className="ml-1 font-medium">{product.rating.toFixed(1)}</span>
                  <span className="ml-1 text-muted-foreground">({product.reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            <div className="text-4xl font-bold">
              {product.isFree ? (
                <span className="text-green-600">Free</span>
              ) : (
                <>
                  {product.isOnSale && product.salePrice ? (
                    <>
                      <span>{formatPrice(product.salePrice)}</span>
                      <span className="text-2xl text-muted-foreground line-through ml-2">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span>{formatPrice(product.price)}</span>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Import Queue
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description || "No description provided."}
              </p>
            </div>

            {product.files.length > 0 && (
              <div>
                <h2 className="font-semibold mb-2">Files Included</h2>
                <div className="space-y-2">
                  {product.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>{file.filename}</span>
                      <span className="text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.tags.length > 0 && (
              <div>
                <h2 className="font-semibold mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(({ tag }) => (
                    <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center gap-4">
              <Link href={`/store/${product.creator.id}`}>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={product.creator.avatar || ""} alt={creatorName} />
                    <AvatarFallback>{creatorName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{creatorName}</p>
                    <p className="text-sm text-muted-foreground">Creator</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <Tabs defaultValue="reviews" className="mt-16">
          <TabsList>
            <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="reviews" className="space-y-4">
            {product.reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet.</p>
            ) : (
              product.reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.user.avatar || ""} alt={review.user.displayName || review.user.username} />
                        <AvatarFallback>{(review.user.displayName || review.user.username)[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{review.user.displayName || review.user.username}</p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-sky-500 fill-current" : "text-gray-300"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {review.title && <p className="font-medium mb-1">{review.title}</p>}
                    {review.content && <p className="text-sm text-muted-foreground">{review.content}</p>}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          <TabsContent value="details">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium">{product.version || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">License Type</p>
                    <p className="font-medium">{product.licenseType || "Standard"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">File Size</p>
                    <p className="font-medium">{product.fileSize ? `${(product.fileSize / 1024 / 1024).toFixed(1)} MB` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Polygon Count</p>
                    <p className="font-medium">{product.polygonCount?.toLocaleString() || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
