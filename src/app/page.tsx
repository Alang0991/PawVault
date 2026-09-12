import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { ProductGrid } from "@/components/product-grid"
import { BundleCard } from "@/components/bundle-card"
import { SectionHeader } from "@/components/section-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CategoryCard } from "@/components/category-card"
import { CreatorCard } from "@/components/creator-card"
import { AnnouncementBar } from "@/components/announcement-bar"
import { StaffPicksSection } from "@/components/staff-picks-section"
import { FollowingFeed } from "@/components/following-feed"
import Link from "next/link"
import { getServerUser } from "@/lib/session"
import {
  Clock,
  Flame,
  Sparkles,
  Star,
  TrendingUp,
  Package,
} from "lucide-react"

export const dynamic = "force-dynamic"

const PRODUCT_CARD_FIELDS = {
  creator: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      isVerified: true,
    },
  },
  media: { where: { isThumbnail: true }, take: 1 },
  reviews: { select: { rating: true } },
  _count: { select: { favorites: true, reviews: true, downloads: true } },
}

function enrich(products: any[]) {
  return products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
          p.reviews.length
        : 0
    return {
      ...p,
      rating: avgRating,
      reviewCount: p.reviews.length,
    }
  })
}

function enrichBundle(bundle: any) {
  const totalValue = bundle.items.reduce(
    (sum: number, item: any) => {
      const p = item.product
      const effectivePrice = p.isOnSale && p.salePrice != null ? p.salePrice : p.price
      return sum + effectivePrice
    },
    0
  )
  const savings = Math.max(0, totalValue - bundle.price)
  return {
    ...bundle,
    totalValue,
    savings,
    savingsPercent: totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0,
    itemCount: bundle._count?.items ?? bundle.items?.length ?? 0,
  }
}

function isSectionActive(section: any): boolean {
  if (!section.enabled) return false
  if (!section.isSeasonal) return true
  const now = new Date()
  const start = section.seasonStart ? new Date(section.seasonStart) : null
  const end = section.seasonEnd ? new Date(section.seasonEnd) : null
  if (start && now < start) return false
  if (end && now > end) return false
  return true
}

async function getSectionData(section: any, user: any) {
  const config = section.config || {}
  const limit = config.limit ?? 8

  switch (section.type) {
    case "hero":
      return { type: "hero", config }

    case "featuredProducts": {
      try {
        const products = await prisma.product.findMany({
          where: { isPublished: true, isFeatured: true, creator: { isInternal: false } },
          take: limit,
          include: PRODUCT_CARD_FIELDS,
          orderBy: { createdAt: "desc" },
        })
        return { type: "featuredProducts", products: enrich(products), config }
      } catch (error) {
        console.error("Failed to fetch featured products:", error)
        return { type: "featuredProducts", products: [], config }
      }
    }

    case "staffPicks": {
      try {
        const picks = await prisma.staffPick.findMany({
          where: {
            isActive: true,
            product: { isPublished: true, creator: { isInternal: false } },
          },
          take: config.limit ?? 6,
          include: {
            product: {
              include: {
                creator: {
                  select: { id: true, username: true, displayName: true, avatar: true, isVerified: true },
                },
                media: { where: { isThumbnail: true }, take: 1 },
                reviews: { select: { rating: true } },
                _count: { select: { favorites: true, reviews: true } },
              },
            },
            staff: { select: { username: true, displayName: true } },
          },
        })
        const enrichedStaffPicks = picks.map((p: any) => {
          const avgRating = p.product.reviews.length > 0
            ? p.product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.product.reviews.length
            : 0
          return {
            id: p.id,
            note: p.note,
            createdAt: p.createdAt.toISOString(),
            product: { ...p.product, rating: avgRating, reviewCount: p.product.reviews.length },
            staff: p.staff,
          }
        })
        return { type: "staffPicks", picks: enrichedStaffPicks, config }
      } catch (error) {
        console.error("Failed to fetch staff picks:", error)
        return { type: "staffPicks", picks: [], config }
      }
    }

    case "followingFeed":
      return { type: "followingFeed", config, userId: user?.id }

    case "trendingProducts": {
      try {
        const products = await prisma.product.findMany({
          where: { isPublished: true, creator: { isInternal: false } },
          take: limit,
          include: PRODUCT_CARD_FIELDS,
          orderBy: { favorites: { _count: "desc" } },
        })
        return { type: "trendingProducts", products: enrich(products), config }
      } catch (error) {
        console.error("Failed to fetch trending products:", error)
        return { type: "trendingProducts", products: [], config }
      }
    }

    case "newDrops": {
      try {
        const products = await prisma.product.findMany({
          where: { isPublished: true, creator: { isInternal: false } },
          take: limit,
          include: PRODUCT_CARD_FIELDS,
          orderBy: { createdAt: "desc" },
        })
        return { type: "newDrops", products: enrich(products), config }
      } catch (error) {
        console.error("Failed to fetch new drops:", error)
        return { type: "newDrops", products: [], config }
      }
    }

    case "categories": {
      try {
        const cats = await prisma.category.findMany({
          where: { parentId: null },
          orderBy: { name: "asc" },
          take: config.limit ?? 8,
          include: {
            _count: { select: { products: { where: { isPublished: true } } } },
          },
        })
        return { type: "categories", categories: cats, config }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        return { type: "categories", categories: [], config }
      }
    }

    case "creatorSpotlight": {
      try {
        const creator = await prisma.user.findFirst({
          where: {
            role: { in: ["CREATOR", "VERIFIED_CREATOR"] },
            creatorStatus: "APPROVED",
            status: "ACTIVE",
            isInternal: false,
            store: { visibility: "PUBLISHED" },
          },
          orderBy: { salesCount: "desc" },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            isVerified: true,
            salesCount: true,
            rating: true,
            followersCount: true,
            store: { select: { name: true, slug: true, banner: true } },
            _count: { select: { products: { where: { isPublished: true } } } },
          },
        })
        return { type: "creatorSpotlight", creator, config }
      } catch (error) {
        console.error("Failed to fetch creator spotlight:", error)
        return { type: "creatorSpotlight", creator: null, config }
      }
    }

    case "freeProducts": {
      try {
        const products = await prisma.product.findMany({
          where: { isPublished: true, isFree: true, creator: { isInternal: false } },
          take: limit,
          include: PRODUCT_CARD_FIELDS,
          orderBy: { createdAt: "desc" },
        })
        return { type: "freeProducts", products: enrich(products), config }
      } catch (error) {
        console.error("Failed to fetch free products:", error)
        return { type: "freeProducts", products: [], config }
      }
    }

    case "bundles": {
      try {
        const bundles = await prisma.bundle.findMany({
          where: {
            isPublished: true,
            creator: {
              creatorStatus: "APPROVED",
              status: "ACTIVE",
              isInternal: false,
              store: { visibility: "PUBLISHED" },
            },
            items: {
              some: {
                product: { isPublished: true, status: "PUBLISHED" },
              },
            },
          },
          take: config.limit ?? 4,
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
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
                visibility: true,
              },
            },
            items: {
              orderBy: { order: "asc" },
              take: 6,
              include: {
                product: {
                  include: {
                    media: { where: { isThumbnail: true }, take: 1 },
                    creator: {
                      select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        isVerified: true,
                      },
                    },
                    reviews: { select: { rating: true } },
                    _count: { select: { reviews: true, favorites: true } },
                  },
                },
              },
            },
            _count: { select: { items: true } },
          },
          orderBy: { createdAt: "desc" },
        })
        return {
          type: "bundles",
          bundles: bundles.map(enrichBundle),
          config,
        }
      } catch (error) {
        console.error("Failed to fetch bundles:", error)
        return { type: "bundles", bundles: [], config }
      }
    }

    case "announcements": {
      try {
        const announcement = await prisma.announcement.findFirst({
          where: { isPublished: true, publishedAt: { not: null } },
          orderBy: { publishedAt: "desc" },
        })
        return { type: "announcements", announcement, config }
      } catch (error) {
        console.error("Failed to fetch announcement:", error)
        return { type: "announcements", announcement: null, config }
      }
    }

    default:
      return { type: section.type, config }
  }
}

async function getHomepageSections() {
  try {
    return await prisma.homepageSection.findMany({
      where: { enabled: true },
      orderBy: { displayOrder: "asc" },
    })
  } catch (error) {
    console.error("Failed to fetch homepage sections:", error)
    return []
  }
}

async function getAnnouncement() {
  try {
    return await prisma.announcement.findFirst({
      where: { isPublished: true, publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
    })
  } catch (error) {
    console.error("Failed to fetch announcement:", error)
    return null
  }
}

export default async function Home() {
  const user = await getServerUser()

  const [sections, announcement] = await Promise.all([
    getHomepageSections(),
    getAnnouncement(),
  ])

  const activeSections = sections.filter(isSectionActive)

  const sectionData = await Promise.all(
    activeSections.map((section) => getSectionData(section, user).catch((err) => {
      console.error(`Failed to fetch section ${section.id}:`, err)
      return { type: section.type, config: section.config }
    }))
  )

  const sectionMap = new Map(activeSections.map((s, i) => [s.id, sectionData[i]]))

  return (
    <div className="min-h-screen bg-background">
      {Array.from(sectionMap.values())
        .filter((data: any) => data.type === "announcements" && data.announcement)
        .map((data: any) => {
          const a = data.announcement
          return (
            <AnnouncementBar
              key="announcement"
              announcement={{ id: a.id, title: a.title, body: a.body, publishedAt: a.publishedAt }}
            />
          )
        })}

      <main className="container mx-auto px-4 py-10 md:py-12 space-y-12">
        {Array.from(sectionMap.entries()).map(([sectionId, data]) => {
          const section = activeSections.find((s) => s.id === sectionId)
          if (!section) return null

          switch (data.type) {
            case "hero": {
              const config = data.config
              return (
                <section key={sectionId} className="border-b">
                  <div className="container mx-auto px-4 py-10 md:py-14">
                    <div className="max-w-2xl">
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
                        <span className="pv-gradient-text">Cool creators.</span>{" "}
                        Cool digital things.
                      </h1>
                      <p className="mt-3 text-base text-text-secondary max-w-lg">
                        Avatars, 3D assets, tools, and more — handmade by creators and
                        built for your next project.
                      </p>
                      {config.showCTA && (
                        <div className="mt-5 flex flex-col sm:flex-row gap-2">
                          <Button size="lg" asChild>
                            <Link href={config.ctaHref ?? "/browse"}>{config.ctaText ?? "Browse Marketplace"}</Link>
                          </Button>
                          <Button variant="secondary" size="lg" asChild>
                            <Link href={config.secondaryCtaHref ?? "/auth/signin"}>{config.secondaryCtaText ?? "Start Selling"}</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )
            }

            case "featuredProducts": {
              const d = data as any
              if (!d.products?.length) return null
              return (
                <section key={sectionId}>
                  <SectionHeader
                    title={d.config.title ?? "Featured"}
                    icon={<Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                    actionLabel={d.config.actionLabel ?? "All featured"}
                    actionHref={d.config.actionHref ?? "/browse?featured=true"}
                  />
                  <ProductGrid products={d.products} />
                </section>
              )
            }

            case "staffPicks": {
              const d = data as any
              if (!d.picks?.length) return null
              return (
                <StaffPicksSection key={sectionId} picks={d.picks} />
              )
            }

            case "followingFeed": {
              const d = data as any
              if (!d.userId) return null
              return <FollowingFeed key={sectionId} userId={d.userId} />
            }

            case "trendingProducts": {
              const d = data as any
              if (!d.products?.length) return null
              return (
                <section key={sectionId}>
                  <SectionHeader
                    title={d.config.title ?? "Trending"}
                    subtitle={d.config.subtitle ?? "Popular right now"}
                    icon={<TrendingUp className="h-4 w-4 text-rose-500" />}
                    actionLabel={d.config.actionLabel ?? "See more"}
                    actionHref={d.config.actionHref ?? "/browse?sort=popular"}
                  />
                  <ProductGrid products={d.products} />
                </section>
              )
            }

            case "newDrops": {
              const d = data as any
              if (!d.products?.length) return null
              return (
                <section key={sectionId}>
                  <SectionHeader
                    title={d.config.title ?? "New Drops"}
                    subtitle={d.config.subtitle ?? "Recently published"}
                    icon={<Clock className="h-4 w-4 text-sky-500" />}
                    actionLabel={d.config.actionLabel ?? "See all new"}
                    actionHref={d.config.actionHref ?? "/browse?sort=newest"}
                  />
                  <ProductGrid products={d.products} />
                </section>
              )
            }

            case "categories": {
              const d = data as any
              if (!d.categories?.length) return null
              return (
                <section key={sectionId}>
                  <SectionHeader
                    title={d.config.title ?? "Shop by Category"}
                    actionLabel={d.config.actionLabel ?? "All categories"}
                    actionHref={d.config.actionHref ?? "/categories"}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {d.categories.map((c: any) => (
                      <CategoryCard key={c.id} category={c} />
                    ))}
                  </div>
                </section>
              )
            }

            case "creatorSpotlight": {
              const d = data as any
              if (!d.creator) return null
              return (
                <section key={sectionId}>
                  <SectionHeader
                    title={d.config.title ?? "Creator Spotlight"}
                    subtitle={d.config.subtitle ?? "Meet the artists behind the assets"}
                    icon={<Sparkles className="h-4 w-4 text-amber-400" />}
                    actionLabel={d.config.actionLabel ?? "View store"}
                    actionHref={`/store/${d.creator.store?.slug || d.creator.username}`}
                  />
                  <CreatorCard creator={d.creator} featured />
                </section>
              )
            }

            case "freeProducts": {
              const d = data as any
              if (!d.products?.length) return null
              return (
                <section key={sectionId}>
                  <SectionHeader
                    title={d.config.title ?? "Free Products"}
                    subtitle={d.config.subtitle ?? "Hand-picked free assets"}
                    icon={<Flame className="h-4 w-4 text-emerald-500" />}
                    actionLabel={d.config.actionLabel ?? "Free in all"}
                    actionHref={d.config.actionHref ?? "/browse?free=true"}
                  />
                  <ProductGrid products={d.products} />
                </section>
              )
            }

            case "bundles": {
              const d = data as any
              if (!d.bundles?.length) return null
              return (
                <section key={sectionId}>
                  <SectionHeader
                    title={d.config.title ?? "Bundles"}
                    subtitle={d.config.subtitle ?? "Curated collections at a discount"}
                    icon={<Package className="h-4 w-4 text-violet-500" />}
                    actionLabel={d.config.actionLabel ?? "All bundles"}
                    actionHref={d.config.actionHref ?? "/bundles"}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {d.bundles.map((bundle: any) => (
                      <BundleCard key={bundle.id} bundle={bundle} />
                    ))}
                  </div>
                </section>
              )
            }

            default:
              return null
          }
        })}
      </main>
    </div>
  )
}