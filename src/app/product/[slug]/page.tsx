import { prisma } from "@/lib/prisma"
import { Price } from "@/components/price"
import { Rating } from "@/components/rating"
import { StatusBadge } from "@/components/status-badge"
import { ProductActions } from "@/components/product-actions"
import { ProductGallery } from "@/components/product-gallery"
import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ShareButton } from "@/components/share-button"
import { getServerUser } from "@/lib/session"
import { hasProductAccess } from "@/lib/ownership"
import { AdultContentPreview } from "@/components/adult-content-preview"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  FileText,
  Tag,
  ExternalLink,
  Star,
  Clock,
  Package,
  Scale,
  Cpu,
  HardDrive,
  ShieldCheck,
} from "lucide-react"

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
          isInternal: true,
        },
      },
      store: {
        select: {
          slug: true,
          visibility: true,
        },
      },
      category: { select: { id: true, name: true, slug: true } },
      media: { orderBy: { order: "asc" } },
      files: {
        select: {
          id: true,
          filename: true,
          size: true,
          platform: true,
          version: true,
          folder: true,
        },
      },
      tags: { include: { tag: true } },
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
      versions: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
      staffPicks: {
        where: { isActive: true },
        take: 1,
      },
    },
  })

  if (!product) notFound()

  if (product.status !== "PUBLISHED" || !product.isPublished || product.store?.visibility !== "PUBLISHED" || product.creator.isInternal) {
    const user = await getServerUser()
    if (!user || (product.creatorId !== user.id && user.role !== "FOUNDER")) {
      notFound()
    }
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  // Review distribution
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = product.reviews.filter((r) => r.rating === stars).length
    return {
      stars,
      count,
      percentage: product.reviews.length > 0 ? Math.round((count / product.reviews.length) * 100) : 0,
    }
  })

  return { ...product, rating: avgRating, reviewCount: product.reviews.length, distribution }
}

async function getMoreFromCreator(creatorId: string, excludeId: string) {
  const products = await prisma.product.findMany({
    where: { creatorId, isPublished: true, id: { not: excludeId }, creator: { isInternal: false } },
    take: 4,
    include: {
      creator: {
        select: { id: true, username: true, displayName: true, avatar: true },
      },
      media: { where: { isThumbnail: true }, take: 1 },
      reviews: { select: { rating: true } },
      _count: { select: { favorites: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 0
    return { ...p, rating: avgRating, reviewCount: p.reviews.length }
  })
}

async function getRelatedProducts(categoryId: string | null, excludeId: string) {
  if (!categoryId) return []
  const products = await prisma.product.findMany({
    where: { categoryId, isPublished: true, id: { not: excludeId }, creator: { isInternal: false } },
    take: 4,
    include: {
      creator: {
        select: { id: true, username: true, displayName: true, avatar: true },
      },
      media: { where: { isThumbnail: true }, take: 1 },
      reviews: { select: { rating: true } },
      _count: { select: { favorites: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 0
    return { ...p, rating: avgRating, reviewCount: p.reviews.length }
  })
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  return {
    title: `${product.title} | PawVault`,
    description:
      product.seoDescription ||
      product.description ||
      `Buy ${product.title} on PawVault`,
    alternates: {
      canonical: `https://pawvault.com/product/${product.slug}`,
    },
    openGraph: {
      title: product.title,
      description:
        product.seoDescription ||
        product.description ||
        `Buy ${product.title} on PawVault`,
      type: "website",
      url: `https://pawvault.com/product/${product.slug}`,
      images: product.media.length > 0 ? [product.media[0].url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description:
        product.seoDescription ||
        product.description ||
        `Buy ${product.title} on PawVault`,
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  const currentUser = await getServerUser()
  const ownership = currentUser
    ? await hasProductAccess(currentUser.id, product.id)
    : { hasAccess: false, isCreator: false, licenseStatus: null, orderStatus: null }

  const isWishlisted = currentUser
    ? await prisma.wishlistItem.findFirst({
        where: { userId: currentUser.id, productId: product.id },
        select: { id: true },
      })
    : null

  const hasDiscount =
    product.isOnSale && product.salePrice && product.salePrice < product.price

  const [moreFromCreator, relatedProducts] = await Promise.all([
    getMoreFromCreator(product.creator.id, product.id),
    getRelatedProducts(product.categoryId, product.id),
  ])

  const mediaItems = product.media.map((m) => ({ id: m.id, url: m.url, alt: `${product.title} ${m.order + 1}` }))
  const creatorName = product.creator.displayName || product.creator.username

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[480px_1fr]">
          {/* Gallery */}
          <div>
            <ProductGallery
              items={mediaItems}
              title={product.title}
              contentRating={product.contentRating}
            />
          </div>

          {/* Purchase area */}
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {hasDiscount && <StatusBadge type="sale" />}
              {product.isFree && <StatusBadge type="free" />}
              {ownership.hasAccess && <StatusBadge type="owned" />}
              {product.contentRating !== "SFW" && <StatusBadge type="mature" />}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="mt-1 text-text-secondary">{product.subtitle}</p>
              )}
            </div>

            <Link
              href={`/creators/${product.creator.username}`}
              className="flex items-center gap-3 hover:bg-muted p-2 -mx-2 rounded-lg transition-colors"
            >
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={product.creator.avatar || ""} alt={creatorName} />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-semibold">
                  {creatorName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm text-text-primary">
                    {creatorName}
                  </p>
                  {product.creator.isVerified && (
                    <StatusBadge type="verified" size="sm" />
                  )}
                </div>
                <p className="text-xs text-text-muted">View profile</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Rating
                rating={product.rating}
                reviewCount={product.reviews.length}
                size="md"
                showCount={product.reviews.length > 0}
              />
              <span className="text-xs text-text-muted">
                {product.reviews.length} review
                {product.reviews.length === 1 ? "" : "s"}
              </span>
            </div>

            <div>
              <p className="sr-only">Price</p>
              <Price
                amount={product.price}
                salePrice={product.salePrice}
                isFree={product.isFree}
                amountClassName="text-3xl"
              />
            </div>

            <ProductActions
              productId={product.id}
              isFree={product.isFree}
              initialWishlisted={!!isWishlisted}
            />
            <ShareButton
              url={`https://pawvault.com/product/${product.slug}`}
              title={product.title}
            />

            {/* Key metadata badges */}
            <div className="flex flex-wrap gap-2">
              {product.version && (
                <Badge variant="outline" size="sm">
                  v{product.version}
                </Badge>
              )}
              {product.licenseType && (
                <Badge variant="outline" size="sm">
                  {product.licenseType}
                </Badge>
              )}
              {product.unityVersion && (
                <Badge variant="outline" size="sm">
                  Unity {product.unityVersion}
                </Badge>
              )}
              {product.pcCompatible && (
                <Badge variant="outline" size="sm">
                  PC
                </Badge>
              )}
              {product.questCompatible && (
                <Badge variant="outline" size="sm">
                  Quest
                </Badge>
              )}
            </div>

            <Separator />

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({product.reviews.length})
                </TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {product.description || "No description provided."}
                </p>
              </TabsContent>

              <TabsContent value="details" className="mt-4 space-y-4">
                {product.files.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary mb-2 flex items-center gap-1.5">
                      <FileText className="h-4 w-4" /> What&apos;s Included
                    </h3>
                    <div className="space-y-2">
                      {product.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-text-secondary">
                            {file.filename}
                          </span>
                          <span className="text-xs text-text-muted">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                            {file.platform && ` · ${file.platform}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {product.version && (
                    <DetailItem label="Version">{product.version}</DetailItem>
                  )}
                  <DetailItem label="License">
                    {product.licenseType || "Standard"}
                  </DetailItem>
                  <DetailItem label="File Size">
                    {product.fileSize
                      ? `${(product.fileSize / 1024 / 1024).toFixed(1)} MB`
                      : "N/A"}
                  </DetailItem>
                  {product.polygonCount && (
                    <DetailItem label="Polygons">
                      {product.polygonCount.toLocaleString()}
                    </DetailItem>
                  )}
                  <DetailItem label="PC Compatible">
                    {product.pcCompatible ? "Yes" : "No"}
                  </DetailItem>
                  <DetailItem label="Quest Compatible">
                    {product.questCompatible ? "Yes" : "No"}
                  </DetailItem>
                  {product.unityVersion && (
                    <DetailItem label="Unity">{product.unityVersion}</DetailItem>
                  )}
                  {product.vrcSdkVersion && (
                    <DetailItem label="VRChat SDK">{product.vrcSdkVersion}</DetailItem>
                  )}
                </div>

                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map(({ tag }) => (
                      <Badge key={tag.id} variant="secondary" size="sm">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {product.category && (
                  <div className="text-sm">
                    <span className="text-text-muted">Category: </span>
                    <Link
                      href={`/categories/${product.category.slug}`}
                      className="text-accent hover:text-accent-hover"
                    >
                      {product.category.name}
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="versions" className="mt-4">
                {product.versions && product.versions.length > 0 ? (
                  <div className="space-y-3">
                    {product.versions.map((v: any) => (
                      <Card key={v.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Version {v.version}
                            </CardTitle>
                            {v.isCurrent && (
                              <Badge variant="success" size="sm">Current</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {v.releaseNotes && (
                            <p className="text-sm text-text-secondary whitespace-pre-wrap">
                              {v.releaseNotes}
                            </p>
                          )}
                          {v.changelog && (
                            <p className="text-xs text-text-muted mt-2">
                              {v.changelog}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted py-8 text-center">
                    No version history available yet.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                {product.reviews.length === 0 ? (
                  <p className="text-sm text-text-muted py-8 text-center">
                    No reviews yet. Be the first to review.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Review distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Rating Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="text-3xl font-bold">
                            {product.rating.toFixed(1)}
                          </div>
                          <div className="flex-1 space-y-1">
                            {product.distribution.map((d: any) => (
                              <div key={d.stars} className="flex items-center gap-2 text-sm">
                                <span className="w-8 text-right">{d.stars}★</span>
                                <div className="flex-1 h-2 bg-surface-subtle rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-amber-400"
                                    style={{ width: `${d.percentage}%` }}
                                  />
                                </div>
                                <span className="w-8 text-text-muted">{d.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Reviews list */}
                    <div className="space-y-4">
                      {product.reviews.map((review) => (
                        <Card key={review.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={review.user.avatar || ""}
                                  alt={review.user.displayName || review.user.username}
                                />
                                <AvatarFallback className="text-xs">
                                  {(review.user.displayName || review.user.username)[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {review.user.displayName || review.user.username}
                                </p>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Rating
                                      key={i}
                                      rating={i < review.rating ? 1 : 0}
                                      size="sm"
                                      showCount={false}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {review.title && (
                              <p className="font-medium text-sm text-text-primary mb-1">
                                {review.title}
                              </p>
                            )}
                            {review.content && (
                              <p className="text-sm text-text-secondary">
                                {review.content}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related sections */}
        {moreFromCreator.length > 0 && (
          <div className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">
                More from {creatorName}
              </h2>
              <Link
                href={product.store?.slug ? `/store/${product.store.slug}` : `/store/${product.creator.username}`}
                className="text-sm text-text-secondary hover:text-accent flex items-center gap-1"
              >
                View store <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <ProductGrid products={moreFromCreator} />
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">
                Related Products
              </h2>
              {product.category && (
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="text-sm text-text-secondary hover:text-accent flex items-center gap-1"
                >
                  Browse {product.category.name} <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  )
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-muted uppercase tracking-wider">
        {label}
      </p>
      <p className="font-medium text-text-primary">{children}</p>
    </div>
  )
}
