import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/helpers"

export const dynamic = "force-dynamic"

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const user = await getServerUser()

  const profileUser = await prisma.user.findFirst({
    where: { username: params.username },
    include: {
      store: true,
      products: {
        where: { isPublished: true },
        take: 6,
        include: {
          media: {
            where: { isThumbnail: true },
            take: 1,
          },
          reviews: {
            select: { rating: true },
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
  const isFollowing = false

  return (
    <div className="min-h-screen">
      <div className="h-64 bg-gradient-to-br from-gray-900 to-gray-700 relative">
        {profileUser.store?.banner && (
          <img src={profileUser.store.banner} alt={name} className="w-full h-full object-cover opacity-50" />
        )}
      </div>
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-8">
          <div className="flex items-end gap-6">
            <Avatar className="h-32 w-32 border-4 border-white bg-white">
              <AvatarImage src={profileUser.avatar || ""} alt={name} />
              <AvatarFallback className="text-4xl">{name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 py-4">
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="text-muted-foreground">@{profileUser.username}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{profileUser.followersCount} followers</span>
                <span>·</span>
                <span>{profileUser.salesCount} sales</span>
                {profileUser.isVerified && <Badge>Verified</Badge>}
              </div>
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2">
                <Button>Follow</Button>
                <Button variant="outline">Message</Button>
              </div>
            )}
          </div>
        </div>

        {profileUser.bio && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground">{profileUser.bio}</p>
            </CardContent>
          </Card>
        )}

        {profileUser.products.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Assets</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profileUser.products.map((product) => {
                const avgRating = product.reviews.length > 0
                  ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                  : 0

                return (
                  <div key={product.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {product.media[0] ? (
                        <img src={product.media[0].url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {avgRating > 0 && `${avgRating.toFixed(1)} · `}
                        {product.reviews.length} reviews
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
