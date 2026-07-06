export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

async function getShops() {
  return prisma.store.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          followersCount: true,
        },
      },
      products: {
        where: { isPublished: true },
        select: { id: true },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function ShopsPage() {
  const shops = await getShops()

  return (
    <div className="min-h-screen">
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Creator Shops</h1>
          <p className="text-muted-foreground mt-2">Browse creator shops</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {shops.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No shops yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((store) => {
              const creatorName = store.user.displayName || store.user.username
              return (
                <Link key={store.id} href={`/store/${store.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={store.user.avatar || ""} alt={creatorName} />
                          <AvatarFallback>{creatorName[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{store.name}</h3>
                           <p className="text-sm text-muted-foreground">{store._count.products} assets</p>
                          <p className="text-sm text-muted-foreground">{store.user.followersCount} followers</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
