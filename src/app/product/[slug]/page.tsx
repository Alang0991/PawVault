import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/helpers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Star, Download, FileText, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { ProductActions } from "@/components/product-actions"
import { getServerUser } from "@/lib/session"
import { ShareButton } from "@/components/share-button"
import { hasProductAccess } from "@/lib/ownership"
import { AdultContentPreview } from "@/components/adult-content-preview"

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
            isVerified: true,
          },
        },
      category: { select: { id: true, name: true, slug: true } },
      media: {
        orderBy: { order: "asc" },
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
    title: `${product.title} | PawVault`,
    description: product.seoDescription || product.description || `Buy ${product.title} on PawVault`,
    alternates: {
      canonical: `https://pawvault.com/product/${product.slug}`,
    },
    openGraph: {
      title: product.title,
      description: product.seoDescription || product.description || `Buy ${product.title} on PawVault`,
      type: "website",
      url: `https://pawvault.com/product/${product.slug}`,
      images: product.media.length > 0 ? [product.media[0].url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.seoDescription || product.description || `Buy ${product.title} on PawVault`,
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  const creatorName = product.creator.displayName || product.creator.username
  const currentUser = await getServerUser()
  const ownership = currentUser ? await hasProductAccess(currentUser.id, product.id) : { hasAccess: false, isCreator: false }

  const thumbnail = product.media.find((m) => m.isThumbnail) || product.media[0]
  const gallery = product.media.filter((m) => m !== thumbnail)

  const moreFromCreator = product.creator.id
    ? await prisma.product.findMany({
        where: { creatorId: product.creator.id, isPublished: true, id: { not: product.id } },
        take: 4,
        include: {
          creator: { select: { id: true, username: true, displayName: true, avatar: true } },
          media: { where: { isThumbnail: true }, take: 1 },
          reviews: { select: { rating: true } },
          _count: { select: { favorites: true, reviews: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  const moreWithRating = moreFromCreator.map((p: any) => {
    const avgRating = p.reviews.length > 0 ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length : 0
    return { ...p, rating: avgRating, reviewCount: p.reviews.length }
  })

  const relatedProducts = product.category?.id
    ? await prisma.product.findMany({
        where: { categoryId: product.category.id, isPublished: true, id: { not: product.id } },
        take: 4,
        include: {
          creator: { select: { id: true, username: true, displayName: true, avatar: true } },
          media: { where: { isThumbnail: true }, take: 1 },
          reviews: { select: { rating: true } },
          _count: { select: { favorites: true, reviews: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  const relatedWithRating = relatedProducts.map((p: any) => {
    const avgRating = p.reviews.length > 0 ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length : 0
    return { ...p, rating: avgRating, reviewCount: p.reviews.length }
  })

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="aspect-video bg-muted relative overflow-hidden rounded-lg">
              {thumbnail ? (
                <AdultContentPreview
                  mediaId={thumbnail.id}
                  directUrl={thumbnail.url}
                  contentRating={product.contentRating}
                  alt={product.title}
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover"
                  variant="image"
                  aspect="video"
                  showBadge
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {gallery.slice(0, 4).map((media) => (
                  <div key={media.id} className="aspect-video bg-muted relative overflow-hidden rounded">
                    <AdultContentPreview
                      mediaId={media.id}
                      directUrl={media.url}
                      contentRating={product.contentRating}
                      alt={`${product.title} ${media.order + 1}`}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover"
                      variant="image"
                      aspect="video"
                      showBadge={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {product.isOnSale && product.salePrice && (
                  <Badge className="bg-rose-600 text-white" aria-label="On sale">Sale</Badge>
                )}
                {product.isFree && (
                  <Badge className="bg-emerald-600 text-white" aria-label="Free product">Free</Badge>
                )}
                {ownership.hasAccess && (
                  <Badge className="bg-sky-600 text-white" aria-label="You own this product">Owned</Badge>
                )}
                {product.contentRating !== "SFW" && (
                  <Badge variant="destructive" aria-label="Mature content">18+</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              {product.subtitle && (
                <p className="text-muted-foreground mt-1">{product.subtitle}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <Link href={`/profile/${product.creator.username}`} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={product.creator.avatar || ""} alt={creatorName} />
                    <AvatarFallback>{creatorName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-sm">{creatorName}</p>
                      {product.creator.isVerified && (
                        <Badge className="h-3.5 w-3.5 p-0 rounded-full bg-sky-500 text-white border-0 flex items-center justify-center">
                          <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Creator</p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-amber-500 fill-current" />
                  <span className="ml-1 font-medium">{product.rating.toFixed(1)}</span>
                  <span className="ml-1 text-muted-foreground">({product.reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            <div className="text-4xl font-bold">
              {product.isFree ? (
                <span className="text-emerald-600">Free</span>
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
              <ProductActions productId={product.id} isFree={product.isFree} />
              <ShareButton url={`https://pawvault.com/product/${product.slug}`} title={product.title} />
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
                <h2 className="font-semibold mb-2">What&apos;s Included</h2>
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

            {product.polygonCount && (
              <div>
                <h2 className="font-semibold mb-2">Details</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Polygons</p>
                    <p className="font-medium">{product.polygonCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">File Size</p>
                    <p className="font-medium">{product.fileSize ? `${(product.fileSize / 1024 / 1024).toFixed(1)} MB` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Quest Compatible</p>
                    <p className="font-medium">{product.questCompatible ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">PC Compatible</p>
                    <p className="font-medium">{product.pcCompatible ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {product.version && <Badge variant="outline">Version {product.version}</Badge>}
              {product.licenseType && <Badge variant="outline">{product.licenseType}</Badge>}
              {product.unityVersion && <Badge variant="outline">Unity {product.unityVersion}</Badge>}
              {product.vrcSdkVersion && <Badge variant="outline">VRChat SDK {product.vrcSdkVersion}</Badge>}
            </div>

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

            {product.category && (
              <div>
                <h2 className="font-semibold mb-2">Category</h2>
                <Link href={`/categories/${product.category.slug}`} className="text-sm text-primary hover:underline">
                  {product.category.name}
                </Link>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="reviews" className="mt-16">
          <TabsList>
            <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="reviews" className="mt-6 space-y-4">
            {product.reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
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
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-amber-500 fill-current" : "text-gray-300"}`} />
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
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Version</p>
                    <p className="font-medium">{product.version || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">License</p>
                    <p className="font-medium">{product.licenseType || "Standard"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">File Size</p>
                    <p className="font-medium">{product.fileSize ? `${(product.fileSize / 1024 / 1024).toFixed(1)} MB` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Polygon Count</p>
                    <p className="font-medium">{product.polygonCount?.toLocaleString() || "N/A"}</p>
                  </div>
                  {product.unityVersion && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Unity</p>
                      <p className="font-medium">{product.unityVersion}</p>
                    </div>
                  )}
                  {product.vrcSdkVersion && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">VRChat SDK</p>
                      <p className="font-medium">{product.vrcSdkVersion}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {moreWithRating.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">More from {creatorName}</h2>
              <Link href={`/store/${product.creator.username}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View store <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {moreWithRating.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {relatedWithRating.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Related Products</h2>
              {product.category && (
                <Link href={`/categories/${product.category.slug}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Browse {product.category.name} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedWithRating.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
