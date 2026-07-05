import { prisma } from "@/lib/db"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/helpers"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function CreatorProductsPage() {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const products = await prisma.product.findMany({
    where: { creatorId: user.id },
    include: {
      category: true,
      media: {
        where: { isThumbnail: true },
        take: 1,
      },
      reviews: {
        select: { rating: true },
      },
      _count: {
        select: { reviews: true, favorites: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Assets</h1>
          <Button asChild>
            <Link href="/creator/products/new">Upload Asset</Link>
          </Button>
        </div>
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No assets yet.</p>
              <Button asChild>
                <Link href="/creator/products/new">Create Your First Asset</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const avgRating = product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0

              return (
                <Card key={product.id}>
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="w-24 h-24 bg-muted rounded overflow-hidden shrink-0">
                      {product.media[0] ? (
                        <img src={product.media[0].url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.category?.name || "Uncategorized"} · {avgRating.toFixed(1)} · {product._count.reviews} reviews
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={product.isPublished ? "default" : "secondary"}>
                          {product.isPublished ? "Published" : "Draft"}
                        </Badge>
                        {product.isOnSale && product.salePrice && (
                          <Badge variant="destructive">On Sale</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold">{formatPrice(product.price)}</p>
                      <div className="flex gap-2 mt-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/creator/products/${product.id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
