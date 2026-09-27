import { prisma } from "@/lib/prisma"
import { getTrendingProductIds } from "@/lib/trending"
import { ProductGrid } from "@/components/product-grid"
import { BundleCard } from "@/components/bundle-card"
import { SectionHeader } from "@/components/section-header"
import { MarketplaceHero } from "@/components/marketplace-hero"
import { PopularCreators } from "@/components/popular-creators"
import { CommissionsBand } from "@/components/commissions-band"
import { CategoryCard } from "@/components/category-card"
import { CreatorCard } from "@/components/creator-card"
import { AnnouncementBar } from "@/components/announcement-bar"
import { FollowingFeed } from "@/components/following-feed"
import { getServerUser } from "@/lib/session"
import { getUserLocale } from "@/lib/i18n/server"
import { loadTranslations, t as translate } from "@/lib/i18n/translation-loader"

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

async function getTopLevelCategories() {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { displayOrder: "asc" },
      take: 8,
      select: { id: true, name: true, slug: true },
    })
  } catch (error) {
    console.error("Failed to fetch homepage categories:", error)
    return []
  }
}

/** Ranked by the shared trending score, then hydrated for the product card. */
async function getTrendingProducts(limit: number, excludeIds: string[]) {
  const rankedIds = await getTrendingProductIds(limit, excludeIds)
  if (rankedIds.length === 0) return []

  const products = await prisma.product.findMany({
    where: { id: { in: rankedIds } },
    include: PRODUCT_CARD_FIELDS,
  })

  const order = new Map(rankedIds.map((id, i) => [id, i]))
  return enrich(products).sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
  )
}

async function getSectionData(section: any, user: any, usedIds: Set<string>) {
  const config = section.config || {}
  const limit = config.limit ?? 8

  switch (section.type) {
    case "hero":
      return { type: "hero", config, usedIds: [] }

    case "featuredProducts": {
      try {
        const products = await prisma.product.findMany({
          where: {
            isPublished: true,
            isFeatured: true,
            creator: { isInternal: false },
            id: { notIn: [...usedIds] },
          },
          take: limit,
          include: PRODUCT_CARD_FIELDS,
          orderBy: { createdAt: "desc" },
        })
        const enriched = enrich(products)
        return { type: "featuredProducts", products: enriched, config, usedIds: products.map((p) => p.id) }
      } catch (error) {
        console.error("Failed to fetch featured products:", error)
        return { type: "featuredProducts", products: [], config, usedIds: [] }
      }
    }

    case "popularCreators": {
      try {
        const creators = await prisma.user.findMany({
          where: {
            role: { in: ["CREATOR", "VERIFIED_CREATOR"] },
            creatorStatus: "APPROVED",
            status: "ACTIVE",
            isInternal: false,
            store: { visibility: "PUBLISHED" },
          },
          take: config.limit ?? 4,
          orderBy: [
            { salesCount: "desc" },
            { followersCount: "desc" },
          ],
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
        return { type: "popularCreators", creators, config, usedIds: [] }
      } catch (error) {
        console.error("Failed to fetch popular creators:", error)
        return { type: "popularCreators", creators: [], config, usedIds: [] }
      }
    }

    case "commissions": {
      return { type: "commissions", config, usedIds: [] }
    }

    case "followingFeed":
      return { type: "followingFeed", config, userId: user?.id, usedIds: [] }

    case "trendingProducts": {
      try {
        const products = await getTrendingProducts(limit, [...usedIds])
        return { type: "trendingProducts", products, config, usedIds: products.map((p) => p.id) }
      } catch (error) {
        console.error("Failed to fetch trending products:", error)
        return { type: "trendingProducts", products: [], config, usedIds: [] }
      }
    }

    case "newDrops": {
      try {
        const products = await prisma.product.findMany({
          where: {
            isPublished: true,
            creator: { isInternal: false },
            id: { notIn: [...usedIds] },
          },
          take: limit,
          include: PRODUCT_CARD_FIELDS,
          orderBy: { createdAt: "desc" },
        })
        const enriched = enrich(products)
        return { type: "newDrops", products: enriched, config, usedIds: products.map((p) => p.id) }
      } catch (error) {
        console.error("Failed to fetch new drops:", error)
        return { type: "newDrops", products: [], config, usedIds: [] }
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
        return { type: "categories", categories: cats, config, usedIds: [] }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        return { type: "categories", categories: [], config, usedIds: [] }
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
        return { type: "creatorSpotlight", creator, config, usedIds: [] }
      } catch (error) {
        console.error("Failed to fetch creator spotlight:", error)
        return { type: "creatorSpotlight", creator: null, config, usedIds: [] }
      }
    }

    case "freeProducts": {
      try {
        const products = await prisma.product.findMany({
          where: {
            isPublished: true,
            isFree: true,
            creator: { isInternal: false },
            id: { notIn: [...usedIds] },
          },
          take: limit,
          include: PRODUCT_CARD_FIELDS,
          orderBy: { createdAt: "desc" },
        })
        const enriched = enrich(products)
        return { type: "freeProducts", products: enriched, config, usedIds: products.map((p) => p.id) }
      } catch (error) {
        console.error("Failed to fetch free products:", error)
        return { type: "freeProducts", products: [], config, usedIds: [] }
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
        const bundleProductIds: string[] = []
        bundles.forEach((b) => {
          b.items.forEach((item) => {
            if (item.product?.id) bundleProductIds.push(item.product.id)
          })
        })
        return {
          type: "bundles",
          bundles: bundles.map(enrichBundle),
          config,
          usedIds: bundleProductIds,
        }
      } catch (error) {
        console.error("Failed to fetch bundles:", error)
        return { type: "bundles", bundles: [], config, usedIds: [] }
      }
    }

    case "announcements": {
      try {
        const announcement = await prisma.announcement.findFirst({
          where: { isPublished: true, publishedAt: { not: null } },
          orderBy: { publishedAt: "desc" },
        })
        return { type: "announcements", announcement, config, usedIds: [] }
      } catch (error) {
        console.error("Failed to fetch announcement:", error)
        return { type: "announcements", announcement: null, config, usedIds: [] }
      }
    }

    default:
      return { type: section.type, config, usedIds: [] }
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

  const sectionData: any[] = []
  const usedIds = new Set<string>()
  for (const section of activeSections) {
    try {
      const data = await getSectionData(section, user, usedIds)
      sectionData.push(data)
      if (data.usedIds && data.usedIds.length > 0) {
        data.usedIds.forEach((id: string) => usedIds.add(id))
      }
    } catch (err) {
      console.error(`Failed to fetch section ${section.id}:`, err)
      sectionData.push({ type: section.type, config: section.config, usedIds: [] })
    }
  }

  const sectionMap = new Map(activeSections.map((s, i) => [s.id, sectionData[i]]))

  // The CMS can contain duplicate sections (especially after theme/template
  // changes). Keep the first configured instance of each section type so a
  // duplicated hero/category block cannot render twice.
  const dedupedSectionMap = new Map<string, any>()
  const seenTypes = new Set<string>()
  for (const [id, data] of sectionMap) {
    if (seenTypes.has(data.type)) continue
    seenTypes.add(data.type)
    dedupedSectionMap.set(id, data)
  }

  const localeState = await getUserLocale()
  const homeMessages = await loadTranslations(localeState.locale)
  const ht = (key: string) => translate(homeMessages, `home.${key}`)
  // t function without namespace prefix for components that build full keys themselves
  const t = (key: string) => translate(homeMessages, key)

  // The hero carries the category entry points, so it needs them
  // whether or not a full category grid section is enabled.
  const heroCategories = await getTopLevelCategories()

  return (
    <div className="min-h-screen bg-background">
      {Array.from(dedupedSectionMap.values())
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

      <main className="pv-shell pb-20">
        {Array.from(dedupedSectionMap.entries()).map(([sectionId, data]) => {
          const section = activeSections.find((s) => s.id === sectionId)
          if (!section) return null

          switch (data.type) {
            case "hero": {
              const config = data.config ?? {}
              return (
                <section key={sectionId}>
                  <MarketplaceHero
                    eyebrow={ht("eyebrow")}
                    heading={`${ht("headingA")} ${ht("headingB")}`}
                    description={ht("description")}
                    searchPlaceholder={ht("searchPlaceholder")}
                    browseLabel={config.ctaText ?? ht("browse")}
                    browseHref={config.ctaHref ?? "/browse"}
                    sellLabel={config.secondaryCtaText ?? ht("sell")}
                    sellHref={config.secondaryCtaHref ?? "/become-creator"}
                    browseAllCategoriesLabel={ht("browseCategories")}
                    categories={config.showCTA === false ? [] : heroCategories}
                  />
                </section>
              )
            }

            case "featuredProducts": {
              const d = data as any
              if (!d.products?.length) return null
              return (
                <section key={sectionId} className="pv-section">
                  <SectionHeader
                    title={d.config.title ?? ht("featured")}
                    actionLabel={d.config.actionLabel ?? ht("allFeatured")}
                    actionHref={d.config.actionHref ?? "/browse?featured=true"}
                  />
                  <ProductGrid products={d.products} />
                </section>
              )
            }

            case "followingFeed": {
              const d = data as any
              if (!d.userId) return null
              return (
                <div className="pv-section" key={sectionId}>
                  <FollowingFeed userId={d.userId} />
                </div>
              )
            }

            case "trendingProducts": {
              const d = data as any
              if (!d.products?.length) return null
              return (
                <section key={sectionId} className="pv-section">
                  <SectionHeader
                    title={d.config.title ?? ht("trending")}
                    subtitle={d.config.subtitle ?? ht("popularNow")}
                    actionLabel={d.config.actionLabel ?? ht("seeMore")}
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
                <section key={sectionId} className="pv-section">
                  <SectionHeader
                    title={d.config.title ?? ht("newDrops")}
                    subtitle={d.config.subtitle ?? ht("recently")}
                    actionLabel={d.config.actionLabel ?? ht("seeAllNew")}
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
                <section key={sectionId} className="pv-section">
                  <SectionHeader
                    title={d.config.title ?? ht("categories")}
                    actionLabel={d.config.actionLabel ?? ht("allCategories")}
                    actionHref={d.config.actionHref ?? "/categories"}
                  />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {d.categories.map((c: any) => (
                      <CategoryCard key={c.id} category={c} t={t} />
                    ))}
                  </div>
                </section>
              )
            }

            case "popularCreators": {
              const d = data as any
              if (!d.creators?.length) return null
              return (
                <div key={sectionId}>
                  <PopularCreators
                    creators={d.creators}
                    title={d.config.title ?? ht("popularCreators")}
                    subtitle={d.config.subtitle ?? ht("popularCreatorsSub")}
                    actionLabel={d.config.actionLabel ?? ht("allCreators")}
                    actionHref={d.config.actionHref ?? "/creators"}
                  />
                </div>
              )
            }

            case "creatorSpotlight": {
              const d = data as any
              if (!d.creator) return null
              return (
                <section key={sectionId} className="pv-section">
                  <SectionHeader
                    title={d.config.title ?? ht("spotlight")}
                    subtitle={d.config.subtitle ?? ht("meetCreators")}
                    actionLabel={d.config.actionLabel ?? ht("viewStore")}
                    actionHref={`/store/${d.creator.store?.slug || d.creator.username}`}
                  />
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
                    <CreatorCard creator={d.creator} />
                  </div>
                </section>
              )
            }

            case "freeProducts": {
              const d = data as any
              if (!d.products?.length) return null
              return (
                <section key={sectionId} className="pv-section">
                  <SectionHeader
                    title={d.config.title ?? ht("free")}
                    subtitle={d.config.subtitle ?? ht("handPicked")}
                    actionLabel={d.config.actionLabel ?? ht("freeAll")}
                    actionHref={d.config.actionHref ?? "/browse?free=true"}
                  />
                  <ProductGrid products={d.products} />
                </section>
              )
            }

            case "commissions": {
              const d = data as any
              return (
                <div key={sectionId} className="pv-section">
                  <CommissionsBand
                    title={d.config.title ?? ht("commissions")}
                    body={d.config.subtitle ?? ht("commissionsBody")}
                    actionLabel={d.config.actionLabel ?? ht("exploreCommissions")}
                    actionHref={d.config.actionHref ?? "/services"}
                  />
                </div>
              )
            }

            case "bundles": {
              const d = data as any
              if (!d.bundles?.length) return null
              return (
                <section key={sectionId} className="pv-section">
                  <SectionHeader
                    title={d.config.title ?? ht("bundles")}
                    subtitle={d.config.subtitle ?? ht("curated")}
                    actionLabel={d.config.actionLabel ?? ht("allBundles")}
                    actionHref={d.config.actionHref ?? "/bundles"}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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
