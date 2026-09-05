import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowRight, Flame, Sparkles, Clock, TrendingUp, Store, Search } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function Home() {
  let creatorCount = 0
  let productCount = 0
  let downloadCount = 0

  try {
    creatorCount = await prisma.user.count({ where: { role: { in: ["CREATOR", "VERIFIED_CREATOR"] } } })
    productCount = await prisma.product.count({ where: { isPublished: true } })
    downloadCount = await prisma.download.count()
  } catch (error) {
    console.error("Homepage stats error:", error)
  }

  const [
    featuredProducts,
    newProducts,
    trendingCreators,
    categories,
    freeProducts,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, isPublished: true },
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
    }),
    prisma.user.findMany({
      where: { role: { in: ["CREATOR", "VERIFIED_CREATOR"] } },
      take: 8,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        isVerified: true,
        salesCount: true,
        rating: true,
        store: { select: { name: true, slug: true } },
      },
      orderBy: { salesCount: "desc" },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      take: 12,
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
    }),
    prisma.product.findMany({
      where: { isFree: true, isPublished: true },
      take: 8,
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatar: true } },
        media: { where: { isThumbnail: true }, take: 1 },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const enrich = (products: any[]) => {
    return products.map((p: any) => {
      const avgRating = p.reviews.length > 0 ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length : 0
      return { ...p, rating: avgRating, reviewCount: p.reviews.length }
    })
  }

  const featured = enrich(featuredProducts)
  const latest = enrich(newProducts)
  const freebies = enrich(freeProducts)

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Find your next obsession.
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Fresh drops from independent creators. Avatars, 3D assets, tools, and more.
            </p>
          </div>
        </div>
      </section>

      {trendingCreators.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <h2 className="text-xl md:text-2xl font-bold">Top creators</h2>
              </div>
              <Link href="/creators" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {trendingCreators.map((creator: any) => {
                const name = creator.displayName || creator.username
                return (
                  <Link
                    key={creator.id}
                    href={`/store/${creator.store?.slug || creator.username}`}
                    className="group"
                  >
                    <div className="rounded-xl border bg-card p-4 hover:shadow-lg hover:-translate-y-1 transition-all">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={creator.avatar || undefined} alt={name} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-semibold">
                            {name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold truncate group-hover:text-primary transition-colors">{name}</p>
                            {creator.isVerified && (
                              <Badge className="h-4 w-4 p-0 rounded-full bg-sky-500 text-white border-0 flex items-center justify-center">
                                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">@{creator.username}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-sky-500" />
                <h2 className="text-xl md:text-2xl font-bold">New drops</h2>
              </div>
              <Link href="/browse?sort=newest" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                Browse all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latest.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {freebies.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-500" />
                <h2 className="text-xl md:text-2xl font-bold">Free drops</h2>
              </div>
              <Link href="/browse?free=true" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                More freebies <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {freebies.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold">Made by creators. Built for the community.</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Start selling your work today. Keep most of what you earn, reach a global audience, and build your brand.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signin">Create your store</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/browse">Start browsing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
