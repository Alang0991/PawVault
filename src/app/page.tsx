import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { ProductGrid } from "@/components/product-grid"
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

export default async function Home() {
  const user = await getServerUser()
  const [
    featuredProducts,
    trendingProducts,
    newDrops,
    freeProducts,
    spotlightCreator,
    categories,
    announcement,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      take: 4,
      include: PRODUCT_CARD_FIELDS,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isPublished: true },
      take: 8,
      include: PRODUCT_CARD_FIELDS,
      orderBy: { favorites: { _count: "desc" } },
    }),
    prisma.product.findMany({
      where: { isPublished: true },
      take: 8,
      include: PRODUCT_CARD_FIELDS,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isPublished: true, isFree: true },
      take: 8,
      include: PRODUCT_CARD_FIELDS,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findFirst({
      where: {
        role: { in: ["CREATOR", "VERIFIED_CREATOR"] },
        store: { isNot: null },
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
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      take: 8,
      include: {
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
    }),
    prisma.announcement.findFirst({
      where: { isPublished: true, publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
    }),
  ])

  let staffPicks: any[] = []
  try {
    staffPicks = await prisma.staffPick.findMany({
      where: { isActive: true },
      take: 6,
      include: {
        product: {
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
            media: { where: { isThumbnail: true }, take: 1 },
            reviews: { select: { rating: true } },
            _count: { select: { favorites: true, reviews: true } },
          },
        },
        staff: { select: { username: true, displayName: true } },
      },
    })
  } catch (error) {
    console.error("Staff picks load error:", error)
    staffPicks = []
  }

  const featured = enrich(featuredProducts)
  const trending = enrich(trendingProducts)
  const newDropsList = enrich(newDrops)
  const freeList = enrich(freeProducts)

  const enrichedStaffPicks = staffPicks.map((p: any) => {
    const avgRating =
      p.product.reviews.length > 0
        ? p.product.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
          p.product.reviews.length
        : 0
    return {
      id: p.id,
      note: p.note,
      createdAt: p.createdAt.toISOString(),
      product: {
        ...p.product,
        rating: avgRating,
        reviewCount: p.product.reviews.length,
      },
      staff: p.staff,
    }
  })

  const anyProducts =
    featured.length > 0 ||
    trending.length > 0 ||
    newDropsList.length > 0 ||
    freeList.length > 0
  const anyCreators = spotlightCreator !== null
  const anyCategories = categories.length > 0

  const hasContent = anyProducts || anyCreators || anyCategories

  return (
    <div className="min-h-screen bg-background">
      {announcement && <AnnouncementBar announcement={announcement} />}

      {/* Hero — compact, marketplace-first */}
      <section className="border-b">
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
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <Button size="lg" asChild>
                <Link href="/browse">Browse Marketplace</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/auth/signin">Start Selling</Link>
              </Button>
            </div>
          </div>

          {featured.length > 0 && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sections */}
      <main className="container mx-auto px-4 py-10 md:py-12 space-y-12">
        {!hasContent && (
          <section className="text-center py-16">
            <div className="mx-auto h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-text-muted" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              More creators are joining PawVault.
            </h2>
            <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
              Be one of the first creators to drop something. We're growing
              fast — new assets land here every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild>
                <Link href="/auth/signin">Start Selling</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/browse">Browse Marketplace</Link>
              </Button>
            </div>
          </section>
        )}

        {enrichedStaffPicks.length > 0 && (
          <StaffPicksSection picks={enrichedStaffPicks} />
        )}

        {user && <FollowingFeed userId={user.id} />}

        {featured.length > 0 && (
          <section>
            <SectionHeader
              title="Featured"
              icon={<Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
              actionLabel="All featured"
              actionHref="/browse?featured=true"
            />
            <ProductGrid products={featured} />
          </section>
        )}

        {trending.length > 0 && (
          <section>
            <SectionHeader
              title="Trending"
              subtitle="Popular right now"
              icon={<TrendingUp className="h-4 w-4 text-rose-500" />}
              actionLabel="See more"
              actionHref="/browse?sort=popular"
            />
            <ProductGrid products={trending} />
          </section>
        )}

        {newDropsList.length > 0 && (
          <section>
            <SectionHeader
              title="New Drops"
              subtitle="Recently published"
              icon={<Clock className="h-4 w-4 text-sky-500" />}
              actionLabel="See all new"
              actionHref="/browse?sort=newest"
            />
            <ProductGrid products={newDropsList} />
          </section>
        )}

        {anyCategories && (
          <section>
            <SectionHeader
              title="Shop by Category"
              actionLabel="All categories"
              actionHref="/categories"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
            </div>
          </section>
        )}

        {anyCreators && spotlightCreator && (
          <section>
            <SectionHeader
              title="Creator Spotlight"
              subtitle="Meet the artists behind the assets"
              icon={<Sparkles className="h-4 w-4 text-amber-400" />}
              actionLabel="View store"
              actionHref={
                `/store/${spotlightCreator.store?.slug || spotlightCreator.username}`
              }
            />
            <CreatorCard creator={spotlightCreator} featured />
          </section>
        )}

        {freeList.length > 0 && (
          <section>
            <SectionHeader
              title="Free Products"
              subtitle="Hand-picked free assets"
              icon={<Flame className="h-4 w-4 text-emerald-500" />}
              actionLabel="Free in all"
              actionHref="/browse?free=true"
            />
            <ProductGrid products={freeList} />
          </section>
        )}
      </main>
    </div>
  )
}
