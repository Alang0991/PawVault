export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RatingStars } from "@/components/rating-stars"
import { SortSelect } from "@/components/sort-select"
import { CategoryFilter } from "@/components/category-filter"
import { Users, Store, Package, User, Star, Twitter, Youtube, MessageCircle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getServerUser } from "@/lib/session"
import { formatPrice } from "@/lib/helpers"
import { FollowButton } from "@/components/follow-button"
import { ShareButton } from "@/components/share-button"
import { getOwnedProducts } from "@/lib/ownership"
import { sanitizeSocialUrl } from "@/lib/sanitizer"
import { AdultContentPreview } from "@/components/adult-content-preview"

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
    where: { username: slug },
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
  creatorId,
  sort,
  category,
  priceMin,
  priceMax,
  page,
}: {
  storeId: string
  creatorId: string
  sort: string
  category?: string
  priceMin?: string
  priceMax?: string
  page: number
}) {
  const where: any = {
    storeId,
    creatorId,
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

function buildStoreHref(
  username: string,
  overrides: Record<string, string | undefined>
) {
  const params = new URLSearchParams()
  const keys = ["sort", "category", "priceMin", "priceMax", "page"]
  for (const key of keys) {
    if (overrides[key] !== undefined) {
      params.set(key, overrides[key]!)
    }
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

  const sort = searchParams.sort || "newest"
  const category = searchParams.category
  const priceMin = searchParams.priceMin
  const priceMax = searchParams.priceMax
  const page = Math.max(1, parseInt(searchParams.page || "1"))

  const [featuredProducts, collections, productsResult, categories, ownedProducts] = await Promise.all([
    getFeaturedProducts(store.id, store.user.id),
    getPublicCollections(store.user.id),
    getStoreProducts({
      storeId: store.id,
      creatorId: store.user.id,
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
  ])

  const ownedProductIds = new Set(ownedProducts.map((op: any) => op.product.id))

  const { products, total, totalPages } = productsResult

  const featuredWithRating = featuredProducts.map((product) => {
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0
    return { ...product, rating: avgRating, reviewCount: product.reviews.length }
  })

  const hasActiveFilters = category || priceMin || priceMax

  return (
    <div className="min-h-screen">
      <div className="h-64 bg-gradient-to-br from-gray-900 to-gray-700 relative">
        {store.banner ? (
          <AdultContentPreview
            directUrl={store.banner}
            contentRating="SFW"
            alt={`Banner for ${store.name}`}
            className="w-full h-full object-cover opacity-50"
            variant="background"
            aspect="video"
            showBadge={false}
          />
        ) : null}
      </div>
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <Avatar className="h-32 w-32 border-4 border-white bg-white shrink-0">
              <AvatarImage src={store.user.avatar || ""} alt={creatorName} />
              <AvatarFallback className="text-4xl">{creatorName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 py-4 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">{store.name}</h1>
                {store.user.isVerified && (
                  <Badge className="gradient-bg text-white border-0">Verified</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                @{store.user.username} · Creator
              </p>
              {store.description && (
                <p className="text-muted-foreground mt-2 line-clamp-2">{store.description}</p>
              )}
              {store.socialLinks && (() => {
                let social: Record<string, string> = {}
                try { social = JSON.parse(store.socialLinks) } catch { return null }
                const twitter = sanitizeSocialUrl(social.twitter)
                const youtube = sanitizeSocialUrl(social.youtube)
                const discord = sanitizeSocialUrl(social.discord)
                if (!twitter && !youtube && !discord) return null
                return (
                  <div className="flex items-center gap-3 mt-3">
                    {twitter && (
                      <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Twitter">
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {youtube && (
                      <a href={youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="YouTube">
                        <Youtube className="h-4 w-4" />
                      </a>
                    )}
                    {discord && (
                      <a href={discord} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Discord">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )
              })()}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <RatingStars rating={store.rating} />
                  {store.rating > 0 && <span>{store.rating.toFixed(1)}</span>}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {store.user.followersCount} followers
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {store.totalProducts} product{store.totalProducts === 1 ? "" : "s"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              {isOwner ? (
                <Button variant="outline" asChild>
                  <Link href="/creator/dashboard">
                    <Store className="h-4 w-4 mr-2" />
                    Manage Store
                  </Link>
                </Button>
              ) : (
                <FollowButton creatorId={store.user.id} creatorName={creatorName} />
              )}
              <ShareButton url={`https://pawvault.com/store/${store.user.username}`} title={store.name} />
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        <nav className="mb-8">
          <div className="flex items-center gap-1 border-b overflow-x-auto">
            <Link
              href={`/store/${store.user.username}`}
              className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Products
              </div>
            </Link>
            <Link
              href={`/profile/${store.user.username}`}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                About
              </div>
            </Link>
            <Link
              href={`/store/${store.user.username}/posts`}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                Posts
              </div>
            </Link>
          </div>
        </nav>

        {featuredWithRating.length > 0 && !hasActiveFilters && page === 1 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold">Featured</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredWithRating.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                  }}
                  isOwned={ownedProductIds.has(product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {collections.length > 0 && !hasActiveFilters && page === 1 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Collections</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collections.slice(0, 3).map((collection) => (
                <Link key={collection.id} href={`/collections/${collection.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
                        {collection.coverImage ? (
                          <img
                            src={collection.coverImage}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            📚
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold truncate">{collection.name}</h3>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {collection.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {collection._count.items} product{collection._count.items === 1 ? "" : "s"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {hasActiveFilters ? "Filtered Products" : "All Products"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {total} product{total === 1 ? "" : "s"}
                {hasActiveFilters && " (filtered)"}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
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
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {category && (
                <Badge variant="secondary" className="gap-1">
                  Category: {category}
                  <Link href={buildStoreHref(store.user.username, { category: undefined, page: undefined })} className="ml-1 hover:text-foreground">
                    ×
                  </Link>
                </Badge>
              )}
              {priceMin && (
                <Badge variant="secondary" className="gap-1">
                  Min: {formatPrice(parseFloat(priceMin))}
                  <Link href={buildStoreHref(store.user.username, { priceMin: undefined, page: undefined })} className="ml-1 hover:text-foreground">
                    ×
                  </Link>
                </Badge>
              )}
              {priceMax && (
                <Badge variant="secondary" className="gap-1">
                  Max: {formatPrice(parseFloat(priceMax))}
                  <Link href={buildStoreHref(store.user.username, { priceMax: undefined, page: undefined })} className="ml-1 hover:text-foreground">
                    ×
                  </Link>
                </Badge>
              )}
              <Link
                href={buildStoreHref(store.user.username, { category: undefined, priceMin: undefined, priceMax: undefined, page: undefined })}
                className="text-sm text-rose-600 hover:underline"
              >
                Clear all
              </Link>
            </div>
          )}

          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {hasActiveFilters
                  ? "No products match your current filters. Try adjusting or clearing your filters."
                  : isOwner
                  ? "Your store is ready but you have not published any products yet."
                  : "This creator has not published any products yet."}
              </p>
              {hasActiveFilters && (
                <Button asChild variant="outline">
                  <Link href={`/store/${store.user.username}`}>Clear filters</Link>
                </Button>
              )}
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      rating: product.rating,
                      reviewCount: product.reviewCount,
                    }}
                    isOwned={ownedProductIds.has(product.id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    asChild={page > 1}
                  >
                    {page > 1 ? (
                      <Link href={buildStoreHref(store.user.username, { page: String(page - 1) })}>Previous</Link>
                    ) : (
                      <span>Previous</span>
                    )}
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    asChild={page < totalPages}
                  >
                    {page < totalPages ? (
                      <Link href={buildStoreHref(store.user.username, { page: String(page + 1) })}>Next</Link>
                    ) : (
                      <span>Next</span>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
