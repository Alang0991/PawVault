import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowRight, Flame, Clock, TrendingUp, Store, Search, Sparkles, Users } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [
    trendingProducts,
    newProducts,
    spotlightCreator,
    categories,
    discoverProducts,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true },
      take: 8,
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatar: true } },
        media: { where: { isThumbnail: true }, take: 1 },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isPublished: true },
      take: 8,
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatar: true } },
        media: { where: { isThumbnail: true }, take: 1 },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: 8,
    }),
    prisma.user.findFirst({
      where: { role: { in: ["CREATOR", "VERIFIED_CREATOR"] } },
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
        store: { select: { name: true, slug: true } },
        _count: { select: { products: { where: { isPublished: true } } } },
      },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      take: 12,
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
    }),
    prisma.product.findMany({
      where: { isPublished: true },
      take: 12,
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatar: true } },
        media: { where: { isThumbnail: true }, take: 1 },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: 16,
    }),
  ])

  const enrich = (products: any[]) => {
    return products.map((p: any) => {
      const avgRating = p.reviews.length > 0 ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length : 0
      return { ...p, rating: avgRating, reviewCount: p.reviews.length }
    })
  }

  const trending = enrich(trendingProducts)
  const latest = enrich(newProducts)
  const discover = enrich(discoverProducts)

  const hasProducts = trending.length > 0 || latest.length > 0 || discover.length > 0
  const hasCreators = spotlightCreator !== null
  const hasCategories = categories.length > 0

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Compact Hero */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              Made by creators.<br />Found on PawVault.
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Avatars, 3D assets, tools, and more — all made by independent creators.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button size="default" asChild>
                <Link href="/browse">Browse Marketplace</Link>
              </Button>
              <Button size="default" variant="outline" asChild>
                <Link href="/creator/dashboard">Start Selling</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {hasCategories && (
        <section className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-2 mb-3">
              <Store className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categories</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  {category.name}
                  <span className="text-xs text-muted-foreground">{category._count.products}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-500" />
                <h2 className="text-lg md:text-xl font-bold">Trending</h2>
              </div>
              <Link href="/browse?sort=popular" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trending.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Creator Spotlight */}
      {hasCreators && spotlightCreator && (
        <section className="border-y bg-muted/30">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h2 className="text-lg md:text-xl font-bold">Creator Spotlight</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
              <Link href={`/store/${spotlightCreator.store?.slug || spotlightCreator.username}`} className="flex flex-col items-center gap-3">
                <Avatar className="h-20 w-20 md:h-24 md:w-24">
                  <AvatarImage src={spotlightCreator.avatar || undefined} alt={spotlightCreator.displayName || spotlightCreator.username} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-bold">
                    {(spotlightCreator.displayName || spotlightCreator.username)[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <p className="font-semibold text-sm">{spotlightCreator.displayName || spotlightCreator.username}</p>
                    {spotlightCreator.isVerified && (
                      <Badge className="h-3.5 w-3.5 p-0 rounded-full bg-sky-500 text-white border-0 flex items-center justify-center">
                        <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">@{spotlightCreator.username}</p>
                </div>
              </Link>
              <div className="space-y-3">
                {spotlightCreator.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{spotlightCreator.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>{spotlightCreator._count.products} product{spotlightCreator._count.products === 1 ? "" : "s"}</span>
                  <span>{spotlightCreator.salesCount || 0} sales</span>
                  <span>{spotlightCreator.followersCount || 0} followers</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/store/${spotlightCreator.store?.slug || spotlightCreator.username}`}>View creator</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New Drops */}
      {latest.length > 0 && (
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-500" />
                <h2 className="text-lg md:text-xl font-bold">New Drops</h2>
              </div>
              <Link href="/browse?sort=newest" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                Browse all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {latest.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Discover More */}
      {discover.length > 0 && (
        <section className="py-10 md:py-14 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <h2 className="text-lg md:text-xl font-bold">Discover More</h2>
              </div>
              <Link href="/browse" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                Browse all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {discover.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!hasProducts && !hasCreators && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">More creators are joining PawVault.</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Be one of the first creators to drop something.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild>
                  <Link href="/auth/signin">Start Selling</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/browse">Browse Marketplace</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-12 md:py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-3xl font-bold mb-3">
              Ready to sell your work?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create a creator account and start selling digital products in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button size="default" asChild>
                <Link href="/auth/signin">Get Started</Link>
              </Button>
              <Button size="default" variant="outline" asChild>
                <Link href="/browse">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
