import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProductGrid } from "@/components/product-grid"
import { StatusBadge } from "@/components/status-badge"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { FollowButton } from "@/components/follow-button"
import { formatDate } from "@/lib/helpers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  Store,
  Users,
  Package,
  BarChart3,
  Globe,
  Calendar,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const user = await getServerUser()

  const profileUser = await prisma.user.findFirst({
    where: { username: params.username },
    include: {
      store: {
        select: {
          banner: true,
          name: true,
          slug: true,
        },
      },
      products: {
        where: { isPublished: true },
        take: 12,
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
          media: {
            where: { isThumbnail: true },
            take: 1,
          },
          reviews: {
            select: { rating: true },
          },
          _count: {
            select: { favorites: true, reviews: true },
          },
        },
      },
    },
  })

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-text-primary">User not found</h1>
        <p className="text-text-secondary mt-2">
          We couldn&apos;t find a creator with that username.
        </p>
      </div>
    )
  }

  const name = profileUser.displayName || profileUser.username
  const isOwnProfile = user?.id === profileUser.id

  const products = profileUser.products.map((p) => {
    const avgRating = p.reviews.length > 0
      ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
      : 0
    return { ...p, rating: avgRating, reviewCount: p.reviews.length }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-44 md:h-48 w-full overflow-hidden bg-surface-subtle">
        {profileUser.store?.banner ? (
          <AdultContentPreview
            directUrl={profileUser.store.banner}
            contentRating="SFW"
            alt={`${name}'s banner`}
            variant="background"
            aspect="video"
            className="h-44 md:h-48 w-full"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-600/10 via-fuchsia-500/5 to-indigo-600/10" />
        )}
      </div>

      <div className="container mx-auto px-4">
        <div className="relative -mt-14 md:-mt-16 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background bg-surface">
              <AvatarImage src={profileUser.avatar || ""} alt={name} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-semibold">
                {name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-text-primary">{name}</h1>
                {profileUser.isVerified && <StatusBadge type="verified" />}
              </div>
              <p className="text-sm text-text-secondary">@ {profileUser.username}</p>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {profileUser.followersCount} followers
                </span>
                <span className="flex items-center gap-1.5">
                  <Package className="h-4 w-4" />
                  {products.length} product{products.length === 1 ? "" : "s"}
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  {profileUser.salesCount || 0} sales
                </span>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="flex gap-2">
                <FollowButton creatorId={profileUser.id} creatorName={name} />
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/messages?to=${profileUser.username}`}>Message</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="products" className="mb-6">
          <TabsList>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <ProductGrid
              products={products}
              emptyMessage={
                <div className="text-center py-12">
                  <Package className="h-10 w-10 mx-auto text-text-muted mb-3 opacity-40" />
                  <p className="text-text-secondary">
                    {isOwnProfile
                      ? "You haven't published any products yet."
                      : `${name} hasn't published any products yet.`}
                  </p>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                {profileUser.bio ? (
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">
                    {profileUser.bio}
                  </p>
                ) : (
                  <p className="text-sm text-text-muted">
                    {isOwnProfile
                      ? "Add a bio to tell people about yourself."
                      : `${name} hasn't added a bio yet.`}
                  </p>
                )}

                {profileUser.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
                    <Link
                      href={profileUser.website}
                      className="text-sm text-accent hover:text-accent-hover break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profileUser.website}
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-text-muted mt-0.5" />
                    <div>
                      <p className="text-xs text-text-muted">Member since</p>
                      <p className="font-medium text-text-primary">
                        {formatDate(profileUser.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Sales</p>
                    <p className="font-medium text-text-primary">
                      {profileUser.salesCount || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
