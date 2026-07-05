import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function CreatorsPage() {
  const creators = await prisma.user.findMany({
    where: {
      role: {
        in: ["CREATOR", "VERIFIED_CREATOR"]
      }
    },
    include: {
      _count: {
        select: {
          products: true,
          followers: true
        }
      }
    },
    orderBy: {
      salesCount: "desc"
    }
  })

  const totalCreators = creators.length
  const totalProducts = creators.reduce((sum, c) => sum + c._count.products, 0)
  const totalFollowers = creators.reduce((sum, c) => sum + c._count.followers, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Our Creators</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Meet the talented artists and developers behind amazing digital products
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Creators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">{totalCreators}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Followers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">{totalFollowers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <Card key={creator.id} className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={creator.avatar || undefined} />
                    <AvatarFallback className="text-2xl">
                      {creator.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">
                        {creator.displayName || creator.username}
                      </CardTitle>
                      {creator.role === "VERIFIED_CREATOR" && (
                        <Badge className="gradient-bg text-white">Verified</Badge>
                      )}
                    </div>
                    <CardDescription>@{creator.username}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {creator.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {creator.bio}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{creator._count.products}</div>
                    <div className="text-xs text-gray-500">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{creator._count.followers}</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{creator.salesCount}</div>
                    <div className="text-xs text-gray-500">Sales</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{creator.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">Rating</span>
                </div>

                <Link href={`/creators/${creator.username}`}>
                  <Button className="w-full gradient-bg text-white">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {creators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No creators found</p>
          </div>
        )}
      </div>
    </div>
  )
}
