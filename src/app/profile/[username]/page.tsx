import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/helpers"
import { FollowButton } from "@/components/follow-button"
import { ProductCard } from "@/components/product-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Store, Users, Package, BarChart3 } from "lucide-react"

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
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">User not found</h1>
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
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="h-48 bg-muted relative overflow-hidden">
        {profileUser.store?.banner ? (
          <img src={profileUser.store.banner} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
        )}
      </div>
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-white bg-white">
              <AvatarImage src={profileUser.avatar || ""} alt={name} />
              <AvatarFallback className="text-3xl">{name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 py-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{name}</h1>
                {profileUser.isVerified && (
                  <Badge className="bg-sky-500 text-white border-0">Verified</Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{profileUser.username}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {profileUser.followersCount} followers</span>
                <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {products.length} product{products.length === 1 ? "" : "s"}</span>
                <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> {profileUser.salesCount || 0} sales</span>
              </div>
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2">
                <FollowButton creatorId={profileUser.id} creatorName={name} />
                <Button variant="outline" size="sm">Message</Button>
              </div>
            )}
          </div>
        </div>

        {profileUser.bio && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">About</h2>
              <p className="text-sm text-muted-foreground">{profileUser.bio}</p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="products" className="mb-12">
          <TabsList>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No products yet.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                {profileUser.bio ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profileUser.bio}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No bio yet.</p>
                )}
                {profileUser.website && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Website</p>
                    <Link href={profileUser.website} className="text-sm text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {profileUser.website}
                    </Link>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Member since</p>
                    <p className="font-medium">{formatDate(profileUser.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sales</p>
                    <p className="font-medium">{profileUser.salesCount || 0}</p>
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
