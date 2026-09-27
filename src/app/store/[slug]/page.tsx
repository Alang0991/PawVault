export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { ProductGrid } from "@/components/product-grid"
import { SectionHeader } from "@/components/section-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Rating } from "@/components/rating"
import { StatusBadge } from "@/components/status-badge"
import { SortSelect } from "@/components/sort-select"
import { CategoryFilter } from "@/components/category-filter"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { FollowButton } from "@/components/follow-button"
import { ShareButton } from "@/components/share-button"
import { EmptyState } from "@/components/empty-state"
import { CommissionCard } from "@/components/storefront/commission-card"
import { StorefrontTabs } from "@/components/storefront/storefront-tabs"
import { getOwnedProducts } from "@/lib/ownership"
import { getCreatorCommissions, getCreatorReviews } from "@/lib/commissions"
import { formatCount, pluralize } from "@/lib/format"
import { sanitizeSocialUrl } from "@/lib/sanitizer"
import { getServerUser } from "@/lib/session"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Store,
  Twitter,
  Youtube,
  MessageCircle,
  Layers,
  X,
} from "lucide-react"
import Image from "next/image"

const STORE_PAGE_SIZE = 12

interface StoreData {
  id: string
  name: string
  slug: string
  description?: string
  banner?: string
  socialLinks?: string
  user: {
    id: string
    username: string
    displayName?: string
    avatar?: string
    bio?: string
    followersCount: number
    salesCount: number
    isVerified: boolean
  }
  rating: number
  totalProducts: number
}

async function getStoreData(slug: string): Promise<StoreData | null> {
  const currentUser = await getServerUser()
  const isFounder = currentUser?.role === "FOUNDER"
  const store = await prisma.store.findUnique({
    where: {
        slug,
        user: { ...(!isFounder && { isInternal: false }) },
      },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          followersCount: true,
          salesCount: true,
          isVerified: true,
        },
      },
      _count: {
        select: { products: { where: { isPublished: true } } },
      },
    },
  })

  if (store) {
    const rating = await getStoreRating(store.id)
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description ?? undefined,
      banner: store.banner ?? undefined,
      socialLinks: store.socialLinks ?? undefined,
      user: {
        id: store.user.id,
        username: store.user.username,
        displayName: store.user.displayName ?? undefined,
        avatar: store.user.avatar ?? undefined,
        bio: store.user.bio ?? undefined,
        followersCount: store.user.followersCount,
        salesCount: store.user.salesCount,
        isVerified: store.user.isVerified,
      },
      rating,
      totalProducts: store._count.products,
    }
  }

  const profileUser = await prisma.user.findFirst({
    where: { username: slug, ...(!isFounder && { isInternal: false }) },
    include: {
      store: {
        include: {
          _count: {
            select: { products: { where: { isPublished: true } } },
          },
        },
      },
    },
  })

  if (!profileUser || !profileUser.store) {
    return null
  }

  const rating = await getStoreRating(profileUser.store.id)
  return {
    id: profileUser.store.id,
    name: profileUser.store.name,
    slug: profileUser.store.slug,
    description: profileUser.store.description ?? undefined,
    banner: profileUser.store.banner ?? undefined,
    socialLinks: profileUser.store.socialLinks ?? undefined,
    user: {
      id: profileUser.id,
      username: profileUser.username,
      displayName: profileUser.displayName ?? undefined,
      avatar: profileUser.avatar ?? undefined,
      bio: profileUser.bio ?? undefined,
      followersCount: profileUser.followersCount,
      salesCount: profileUser.salesCount,
      isVerified: profileUser.isVerified,
    },
    rating,
    totalProducts: profileUser.store._count.products,
  }
}

async function getStoreRating(storeId: string): Promise<number> {
  const reviews = await prisma.review.findMany({
    where: {
      product: { storeId, isPublished: true },
    },
    select: { rating: true },
  })

  if (reviews.length === 0) return 0

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return sum / reviews.length
}

async function getFeaturedProducts(storeId: string, creatorId: string) {
  return prisma.product.findMany({
    where: {
      storeId,
      creatorId,
      isFeatured: true,
      isPublished: true,
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
    take: 4,
  })
}

async function getPublicCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId, isPublic: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      coverImage: true,
      _count: {
        select: { items: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
  })
}

async function getStoreProducts({
  storeId,
  sort,
  category,
  priceMin,
  priceMax,
  page,
}: {
  storeId: string
  sort: string
  category?: string
  priceMin?: string
  priceMax?: string
  page: number
}) {
  const where: any = {
    storeId,
    isPublished: true,
    ...(category && { category: { slug: category } }),
    ...(priceMin && { price: { gte: parseFloat(priceMin) } }),
    ...(priceMax && { price: { lte: parseFloat(priceMax) } }),
  }

  const orderBy: any = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    "price-asc": { price: "asc" },
    "price-desc": { price: "desc" },
    rating: { reviews: { _count: "desc" } },
  }[sort] || { createdAt: "desc" }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * STORE_PAGE_SIZE,
      take: STORE_PAGE_SIZE,
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
        category: {
          select: { name: true, slug: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  const productsWithRating = products.map((product) => {
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0

    return {
      ...product,
      rating: avgRating,
      reviewCount: product.reviews.length,
    }
  })

  return { products: productsWithRating, total, totalPages: Math.ceil(total / STORE_PAGE_SIZE) }
}

function buildStoreHref(username: string, overrides: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined) params.set(k, v)
  }
  const qs = params.toString()
  return `/store/${username}${qs ? `?${qs}` : ""}`
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const store = await getStoreData(params.slug)
  if (!store) return { title: "Store Not Found | PawVault" }

  const creatorName = store.user.displayName || store.user.username

  return {
    title: `${store.name} - PawVault Store`,
    description: store.description || `Browse ${store.name} on PawVault. Digital products by ${creatorName}.`,
    openGraph: {
      title: `${store.name} - PawVault Store`,
      description: store.description || `Browse ${store.name} on PawVault. Digital products by ${creatorName}.`,
      type: "website",
      url: `https://pawvault.com/store/${store.user.username}`,
      images: store.banner ? [store.banner] : store.user.avatar ? [store.user.avatar] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${store.name} - PawVault Store`,
      description: store.description || `Browse ${store.name} on PawVault.`,
    },
    alternates: {
      canonical: `https://pawvault.com/store/${store.user.username}`,
    },
  }
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { sort?: string; category?: string; priceMin?: string; priceMax?: string; page?: string }
}) {
  const store = await getStoreData(params.slug)
  if (!store) {
    notFound()
  }

  const currentUser = await getServerUser()
  const creatorName = store.user.displayName || store.user.username
  const isOwner = currentUser?.id === store.user.id
  const isVerified = store.user.isVerified

  const sort = searchParams.sort || "newest"
  const category = searchParams.category
  const priceMin = searchParams.priceMin
  const priceMax = searchParams.priceMax
  const page = Math.max(1, parseInt(searchParams.page || "1"))

  const [
    featuredProducts,
    collections,
    productsResult,
    categories,
    ownedProducts,
    commissions,
    reviews,
  ] = await Promise.all([
    getFeaturedProducts(store.id, store.user.id),
    getPublicCollections(store.user.id),
    getStoreProducts({
      storeId: store.id,
      sort,
      category,
      priceMin,
      priceMax,
      page,
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: {
              where: { storeId: store.id, isPublished: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    currentUser ? getOwnedProducts(currentUser.id) : Promise.resolve([]),
    getCreatorCommissions(store.user.id),
    getCreatorReviews(store.user.id),
  ])

  const ownedProductIds = new Set(ownedProducts.map((op: any) => op.product.id))
  const { products, total, totalPages } = productsResult

  const featuredWithRating = featuredProducts.map((product) => {
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
      : 0
    return { ...product, rating: avgRating, reviewCount: product.reviews.length }
  })

  const hasActiveFilters = Boolean(category || priceMin || priceMax)

  const socialLinks = parseStoreSocialLinks(store.socialLinks)


  return (
    <div className="min-h-screen bg-background">
      {/* Banner: the creator's own image, or a quiet neutral placeholder */}
      <div className="relative h-40 w-full overflow-hidden bg-surface-subtle md:h-56">
        {store.banner && (
          <AdultContentPreview
            directUrl={store.banner}
            contentRating="SFW"
            alt={`Banner for ${store.name}`}
            variant="background"
            aspect="video"
            className="h-full w-full"
          />
        )}
      </div>

      <div className="pv-shell">
        <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 md:flex-row md:items-end md:gap-6">
          <Avatar className="h-24 w-24 shrink-0 border-4 border-background bg-surface md:h-32 md:w-32">
            <AvatarImage src={store.user.avatar || ""} alt={creatorName} />
            <AvatarFallback className="bg-muted text-3xl font-semibold text-text-secondary">
              {creatorName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pb-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              {store.name}
              {isVerified && <StatusBadge type="verified" />}
            </h1>
            <p className="text-sm text-text-muted">
              <Link
                href={`/creators/${store.user.username}`}
                className="underline-offset-4 hover:underline"
              >
                @{store.user.username}
              </Link>
            </p>

            {(store.description || store.user.bio) && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
                {store.description || store.user.bio}
              </p>
            )}

            {socialLinks && (
              <div className="mt-3 flex items-center gap-3">
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-text-muted transition-colors hover:text-text-primary">
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-text-muted transition-colors hover:text-text-primary">
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
                {socialLinks.discord && (
                  <a href={socialLinks.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord" className="text-text-muted transition-colors hover:text-text-primary">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {isOwner ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/creator/dashboard">
                    <Store className="h-4 w-4" />
                    Manage store
                  </Link>
                </Button>
              ) : (
                <FollowButton creatorId={store.user.id} creatorName={creatorName} />
              )}
              <ShareButton
                url={`https://pawvault.com/store/${store.user.username}`}
                title={store.name}
              />
              <Link
                href={`/store/${store.user.username}/posts`}
                className="text-sm text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline"
              >
                Posts
              </Link>
            </div>
          </div>
        </div>

        {/* Stats: plain numbers, no decorative icons */}
        <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border py-4 text-sm">
          <div className="flex items-center gap-1.5">
            <dt className="text-text-muted">Products</dt>
            <dd className="font-medium text-text-primary">
              {formatCount(store.totalProducts)}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-text-muted">Followers</dt>
            <dd className="font-medium text-text-primary">
              {formatCount(store.user.followersCount)}
            </dd>
          </div>
          {store.user.salesCount > 0 && (
            <div className="flex items-center gap-1.5">
              <dt className="text-text-muted">Sales</dt>
              <dd className="font-medium text-text-primary">
                {formatCount(store.user.salesCount)}
              </dd>
            </div>
          )}
          {store.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <dt className="text-text-muted">Rating</dt>
              <dd className="flex items-center gap-1.5 font-medium text-text-primary">
                <Rating rating={store.rating} size="sm" showCount={false} />
                {store.rating.toFixed(1)}
              </dd>
            </div>
          )}
        </dl>

        {featuredWithRating.length > 0 && !hasActiveFilters && page === 1 && (
          <section className="mt-10">
            <SectionHeader title="Featured" />
            <ProductGrid products={featuredWithRating} />
          </section>
        )}

        {collections.length > 0 && !hasActiveFilters && page === 1 && (
          <section className="mt-12">
            <SectionHeader
              title="Collections"
              actionLabel={collections.length > 3 ? "View all" : undefined}
              actionHref={`/creators/${store.user.username}/collections`}
            />
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {collections.slice(0, 3).map((collection) => (
                <li key={collection.id}>
                  <Link href={`/collections/${collection.slug}`} className="group block focus-ring rounded-xl">
                    <div className="pv-product-media aspect-video w-full">
                      {collection.coverImage ? (
                        <Image
                          src={collection.coverImage}
                          alt={collection.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-text-muted">
                          <Layers className="h-6 w-6 opacity-40" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <h3 className="mt-2.5 truncate text-sm font-semibold text-text-primary">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                        {collection.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-text-muted">
                      {pluralize(collection._count.items, "product")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12">
          <StorefrontTabs
            tabs={[
              {
                value: "products",
                label: "Products",
                count: total,
                content: (
                  <section>
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-text-muted">
                        {hasActiveFilters
                          ? `${total} ${total === 1 ? "product" : "products"} matching your filters`
                          : `${total} ${total === 1 ? "product" : "products"}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <SortSelect
                          current={sort}
                          params={{
                            sort,
                            category: category || undefined,
                            priceMin: priceMin || undefined,
                            priceMax: priceMax || undefined,
                          }}
                          basePath={`/store/${store.user.username}`}
                        />
                        <CategoryFilter
                          storeId={store.id}
                          currentCategory={category}
                          categories={categories}
                        />
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <div className="mb-5 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-text-muted">Active filters:</span>
                        {category && (
                          <Link
                            href={buildStoreHref(store.user.username, { category: undefined, page: undefined })}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text-primary"
                          >
                            {categoryLabel(categories, category)}
                            <X className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">Remove category filter</span>
                          </Link>
                        )}
                        {priceMin && (
                          <Link
                            href={buildStoreHref(store.user.username, { priceMin: undefined, page: undefined })}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text-primary"
                          >
                            Min {priceMin}
                            <X className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">Remove minimum price filter</span>
                          </Link>
                        )}
                        {priceMax && (
                          <Link
                            href={buildStoreHref(store.user.username, { priceMax: undefined, page: undefined })}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text-primary"
                          >
                            Max {priceMax}
                            <X className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">Remove maximum price filter</span>
                          </Link>
                        )}
                        <Link
                          href={buildStoreHref(store.user.username, {
                            category: undefined,
                            priceMin: undefined,
                            priceMax: undefined,
                            page: undefined,
                          })}
                          className="text-xs text-text-muted underline-offset-4 transition-colors hover:text-text-primary hover:underline"
                        >
                          Clear all
                        </Link>
                      </div>
                    )}

                    {products.length === 0 ? (
                      <EmptyState
                        title="Nothing here yet."
                        description={
                          hasActiveFilters
                            ? "No products match your current filters."
                            : isOwner
                              ? "Your store is ready, but you haven’t published any products yet."
                              : "This creator hasn’t published any products yet."
                        }
                        action={
                          hasActiveFilters
                            ? { label: "Clear filters", href: `/store/${store.user.username}` }
                            : isOwner
                              ? { label: "Add a product", href: "/creator/products/new" }
                              : undefined
                        }
                      />
                    ) : (
                      <>
                        <ProductGrid
                          products={products.map((p: any) => ({
                            ...p,
                            isOwned: ownedProductIds.has(p.id),
                          }))}
                        />

                        {totalPages > 1 && (
                          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={page <= 1}
                              asChild={page > 1}
                            >
                              {page > 1 ? (
                                <Link href={buildStoreHref(store.user.username, { page: String(page - 1) })}>Previous</Link>
                              ) : (
                                <span>Previous</span>
                              )}
                            </Button>
                            <span className="text-sm text-text-muted">
                              {page} / {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={page >= totalPages}
                              asChild={page < totalPages}
                            >
                              {page < totalPages ? (
                                <Link href={buildStoreHref(store.user.username, { page: String(page + 1) })}>Next</Link>
                              ) : (
                                <span>Next</span>
                              )}
                            </Button>
                          </nav>
                        )}
                      </>
                    )}
                  </section>
                ),
              },
              {
                value: "commissions",
                label: "Commissions",
                count: commissions.length,
                content:
                  commissions.length > 0 ? (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {commissions.map((listing) => (
                        <li key={listing.id}>
                          <CommissionCard listing={listing} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState
                      title="No commissions listed."
                      description={
                        isOwner
                          ? "You haven’t set up commission availability yet."
                          : `${creatorName} isn’t taking commissions right now.`
                      }
                      action={
                        isOwner
                          ? { label: "Set up commissions", href: "/creator/commissions" }
                          : undefined
                      }
                    />
                  ),
              },
              {
                value: "reviews",
                label: "Reviews",
                count: reviews.length,
                content:
                  reviews.length > 0 ? (
                    <ul className="space-y-4">
                      {reviews.map((review) => (
                        <li key={review.id} className="rounded-lg border border-border p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={review.user.avatar || ""}
                                  alt={review.user.displayName || review.user.username}
                                />
                                <AvatarFallback className="bg-muted text-xs text-text-secondary">
                                  {(review.user.displayName || review.user.username)[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-text-primary">
                                  {review.user.displayName || review.user.username}
                                </p>
                                <p className="truncate text-xs text-text-muted">
                                  on {review.product.title}
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <Rating rating={review.rating} size="sm" showCount={false} />
                            </div>
                          </div>
                          {review.title && (
                            <p className="mt-3 text-sm font-medium text-text-primary">
                              {review.title}
                            </p>
                          )}
                          {review.content && (
                            <p className="mt-1 text-sm text-text-secondary">{review.content}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState
                      title="No reviews yet."
                      description="Reviews from buyers will show up here."
                    />
                  ),
              },
              {
                value: "about",
                label: "About",
                content: (
                  <section className="max-w-2xl space-y-4">
                    {store.user.bio && (
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">
                          About {creatorName}
                        </h3>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                          {store.user.bio}
                        </p>
                      </div>
                    )}
                    {store.description && store.description !== store.user.bio && (
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">About this store</h3>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                          {store.description}
                        </p>
                      </div>
                    )}
                    <Link
                      href={`/creators/${store.user.username}`}
                      className="inline-block text-sm text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline"
                    >
                      View full profile
                    </Link>
                  </section>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

function categoryLabel(categories: any[], slug: string | undefined) {
  if (!slug) return ""
  return categories.find((c: any) => c.slug === slug)?.name ?? slug
}

/** Only the three networks we render, each run through the URL sanitiser. */
function parseStoreSocialLinks(raw: string | undefined) {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, string>
    const links = {
      twitter: sanitizeSocialUrl(parsed.twitter),
      youtube: sanitizeSocialUrl(parsed.youtube),
      discord: sanitizeSocialUrl(parsed.discord),
    }
    return links.twitter || links.youtube || links.discord ? links : null
  } catch {
    return null
  }
}
