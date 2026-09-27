import { prisma } from "@/lib/prisma"
import { Price } from "@/components/price"
import { Rating } from "@/components/rating"
import { StatusBadge } from "@/components/status-badge"
import { ProductActions } from "@/components/product-actions"
import { ProductGallery } from "@/components/product-gallery"
import { ProductGrid } from "@/components/product-grid"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { SectionHeader } from "@/components/section-header"
import { ShareButton } from "@/components/share-button"
import { ReportProductDialog } from "@/components/report-product-dialog"
import { ReportReviewButton } from "@/components/report-review-button"
import { CreatorResponseForm } from "@/components/creator-response-form"
import { LikeButton } from "@/components/like-button"
import { DiscussionSection } from "@/components/discussion-section"
import { getServerUser } from "@/lib/session"
import { hasProductAccess } from "@/lib/ownership"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Check } from "lucide-react"

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
      staffPicks: {
        where: { isActive: true },
        take: 1,
      },
    },
  })

  if (!product) notFound()

  // Fetch versions separately with error handling for missing columns
  let versions: any[] = []
  try {
    versions = await prisma.productVersion.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    })
  } catch (error) {
    console.error("Failed to fetch product versions:", error)
    versions = []
  }

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

  return { ...product, rating: avgRating, reviewCount: product.reviews.length, distribution, versions }
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

  // Track recently viewed for authenticated users
  if (currentUser) {
    await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: {
          userId: currentUser.id,
          productId: product.id,
        },
      },
      update: { viewedAt: new Date() },
      create: { userId: currentUser.id, productId: product.id },
    })
  }

  const ownership = currentUser
    ? await hasProductAccess(currentUser.id, product.id)
    : { hasAccess: false, isCreator: false, licenseStatus: null, orderStatus: null }

  const isWishlisted = currentUser
    ? await prisma.wishlistItem.findFirst({
        where: { userId: currentUser.id, productId: product.id },
        select: { id: true },
      })
    : null

  const isLiked = currentUser
    ? await prisma.favorite.findFirst({
        where: { userId: currentUser.id, productId: product.id },
        select: { id: true },
      })
    : null

  const totalLikes = await prisma.favorite.count({ where: { productId: product.id } })

  // A download means the buyer received the file, which is the closest
  // honest proxy for "sales" on a page that has no denormalised counter.
  const salesCount = await prisma.download.count({
    where: { productId: product.id },
  })

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
      <div className="pv-shell py-8 md:py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          {/* Gallery */}
          <div>
            <ProductGallery
              items={mediaItems}
              title={product.title}
              contentRating={product.contentRating}
            />
          </div>

          {/* Purchase area — the decision has to be obvious here (§8) */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {hasDiscount && <StatusBadge type="sale" />}
              {!hasDiscount && product.isFree && <StatusBadge type="free" />}
              {!hasDiscount && !product.isFree && ownership.hasAccess && (
                <StatusBadge type="owned" />
              )}
              {product.contentRating !== "SFW" && <StatusBadge type="mature" />}
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-[32px]">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="mt-1.5 text-text-secondary">{product.subtitle}</p>
              )}
            </div>

            <Link
              href={`/creators/${product.creator.username}`}
              className="-mx-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted focus-ring"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={product.creator.avatar || ""} alt={creatorName} />
                <AvatarFallback className="bg-muted text-sm font-semibold text-text-secondary">
                  {creatorName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                  <span className="truncate">{creatorName}</span>
                  {product.creator.isVerified && (
                    <StatusBadge type="verified" size="sm" />
                  )}
                </p>
                <p className="text-xs text-text-muted">View profile</p>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <Rating
                rating={product.rating}
                reviewCount={product.reviews.length}
                size="md"
                showCount={false}
              />
              <span className="text-text-secondary">{product.rating.toFixed(1)}</span>
              {product.reviews.length > 0 && (
                <>
                  <span className="text-text-muted">·</span>
                  <Link href="#reviews" className="text-text-muted hover:text-text-primary">
                    {product.reviews.length}{" "}
                    {product.reviews.length === 1 ? "review" : "reviews"}
                  </Link>
                </>
              )}
              {salesCount > 0 && (
                <>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-muted">
                    {salesCount} {salesCount === 1 ? "sale" : "sales"}
                  </span>
                </>
              )}
            </div>

            <div>
              <p className="sr-only">Price</p>
              <Price
                amount={product.price}
                salePrice={product.salePrice}
                isFree={product.isFree}
                amountClassName="text-3xl font-bold"
              />
            </div>

            <ProductActions
              productId={product.id}
              isFree={product.isFree}
              initialWishlisted={!!isWishlisted}
            />

            <ul className="space-y-1.5 border-t border-border pt-4 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                Instant download after purchase
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                {product.licenseType ? `${product.licenseType} license` : "License included"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                Updates and creator support
              </li>
            </ul>

            <div className="flex flex-wrap items-center gap-2">
              <ShareButton
                url={`https://pawvault.com/product/${product.slug}`}
                title={product.title}
              />
              {currentUser && (
                <LikeButton
                  productId={product.slug}
                  initialLiked={!!isLiked}
                  initialTotal={totalLikes}
                />
              )}
              <ReportProductDialog
                productId={product.id}
                productTitle={product.title}
                isAuthenticated={!!currentUser}
              />
            </div>

            <Separator />

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({product.reviews.length})
                </TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-5">
                {product.description ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-sm text-text-muted">
                    This creator hasn&apos;t written a description yet.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-5 space-y-6">
                <section>
                  <h3 className="mb-2 text-sm font-semibold text-text-primary">
                    Compatibility
                  </h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <DetailItem label="PC">
                      {product.pcCompatible ? "Yes" : "No"}
                    </DetailItem>
                    <DetailItem label="Quest">
                      {product.questCompatible ? "Yes" : "No"}
                    </DetailItem>
                    {product.unityVersion && (
                      <DetailItem label="Unity">{product.unityVersion}</DetailItem>
                    )}
                    {product.vrcSdkVersion && (
                      <DetailItem label="VRChat SDK">
                        {product.vrcSdkVersion}
                      </DetailItem>
                    )}
                    {product.version && (
                      <DetailItem label="Version">v{product.version}</DetailItem>
                    )}
                    {product.polygonCount && (
                      <DetailItem label="Polygons">
                        {product.polygonCount.toLocaleString()}
                      </DetailItem>
                    )}
                  </dl>
                </section>

                <section>
                  <h3 className="mb-2 text-sm font-semibold text-text-primary">License</h3>
                  <p className="text-sm text-text-secondary">
                    {product.licenseType || "Standard"} — see the{" "}
                    <Link href="/license-agreement" className="text-accent hover:text-accent-hover">
                      license agreement
                    </Link>{" "}
                    for full terms.
                  </p>
                </section>

                {product.files.length > 0 && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold text-text-primary">
                      Files included
                    </h3>
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {product.files.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                        >
                          <span className="truncate text-text-secondary">
                            {file.filename}
                          </span>
                          <span className="shrink-0 text-xs text-text-muted">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                            {file.platform ? ` · ${file.platform}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {product.tags.length > 0 && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold text-text-primary">Tags</h3>
                    <ul className="flex flex-wrap gap-1.5">
                      {product.tags.map(({ tag }) => (
                        <li key={tag.id}>
                          <Link href={`/browse?tags=${tag.slug}`}>
                            <Badge variant="secondary" size="sm">
                              {tag.name}
                            </Badge>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {product.category && (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold text-text-primary">Category</h3>
                    <Link
                      href={`/categories/${product.category.slug}`}
                      className="text-sm text-accent hover:text-accent-hover"
                    >
                      {product.category.name}
                    </Link>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="versions" className="mt-5">
                {product.versions && product.versions.length > 0 ? (
                  <ul className="space-y-3">
                    {product.versions.map((v: any) => (
                      <li
                        key={v.id}
                        className="rounded-lg border border-border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-text-primary">
                            Version {v.version}
                          </p>
                          {v.isCurrent && (
                            <Badge variant="success" size="sm">
                              Current
                            </Badge>
                          )}
                        </div>
                        {v.releaseNotes && (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">
                            {v.releaseNotes}
                          </p>
                        )}
                        {v.changelog && (
                          <p className="mt-1 text-xs text-text-muted">{v.changelog}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-sm text-text-muted">
                    No version history yet.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-5" id="reviews">
                {product.reviews.length === 0 ? (
                  <p className="py-8 text-center text-sm text-text-muted">
                    No reviews yet. Be the first to review.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Review distribution */}
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-5">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-text-primary">
                            {product.rating.toFixed(1)}
                          </p>
                          <Rating
                            rating={product.rating}
                            size="sm"
                            showCount={false}
                            className="justify-center"
                          />
                          <p className="mt-1 text-xs text-text-muted">
                            {product.reviews.length}{" "}
                            {product.reviews.length === 1 ? "review" : "reviews"}
                          </p>
                        </div>
                        <div className="flex-1 space-y-1">
                          {product.distribution.map((d: any) => (
                            <div key={d.stars} className="flex items-center gap-2 text-sm">
                              <span className="w-8 text-right text-text-muted">
                                {d.stars}★
                              </span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
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
                    </div>

                    {/* Reviews list */}
                    <ul className="space-y-4">
                      {product.reviews.map((review) => (
                        <li
                          key={review.id}
                          className="rounded-lg border border-border p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={review.user.avatar || ""}
                                  alt={review.user.displayName || review.user.username}
                                />
                                <AvatarFallback className="text-xs">
                                  {(review.user.displayName || review.user.username)[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-text-primary">
                                  {review.user.displayName || review.user.username}
                                </p>
                                <div className="flex items-center gap-2">
                                  <StarRow rating={review.rating} />
                                  {review.isVerified && (
                                    <span className="text-xs text-text-muted">
                                      Verified purchase
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {currentUser && currentUser.id !== review.userId && (
                              <ReportReviewButton reviewId={review.id} />
                            )}
                          </div>

                          {review.title && (
                            <p className="mt-3 text-sm font-medium text-text-primary">
                              {review.title}
                            </p>
                          )}
                          {review.content && (
                            <p className="mt-1 text-sm text-text-secondary">
                              {review.content}
                            </p>
                          )}

                          {review.creatorResponse ? (
                            <div className="mt-3 border-l-2 border-border pl-3">
                              <p className="text-xs font-medium text-text-muted">
                                Creator response
                                {review.creatorResponseAt &&
                                  ` · ${new Date(review.creatorResponseAt).toLocaleDateString()}`}
                              </p>
                              <p className="mt-1 text-sm text-text-secondary">
                                {review.creatorResponse}
                              </p>
                            </div>
                          ) : (
                            currentUser &&
                            currentUser.id === product.creatorId && (
                              <CreatorResponseForm
                                reviewId={review.id}
                                productId={product.id}
                              />
                            )
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="discussions" className="mt-4">
                <DiscussionSection productId={product.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related sections */}
        {moreFromCreator.length > 0 && (
          <section className="mt-14">
            <SectionHeader
              title={`More from ${creatorName}`}
              actionLabel="View store"
              actionHref={
                product.store?.slug
                  ? `/store/${product.store.slug}`
                  : `/store/${product.creator.username}`
              }
            />
            <ProductGrid products={moreFromCreator} />
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <SectionHeader
              title="Related products"
              actionLabel={product.category ? `Browse ${product.category.name}` : undefined}
              actionHref={
                product.category ? `/categories/${product.category.slug}` : undefined
              }
            />
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  )
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-text-muted">{label}</dt>
      <dd className="font-medium text-text-primary">{children}</dd>
    </div>
  )
}

/** A single row of stars. Rating renders its own five, so it cannot be reused here. */
function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill={i < Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={i < Math.round(rating) ? 0 : 1.5}
          className="h-3 w-3 text-amber-400"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}
