import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ModerationProductsPage() {
  const user = await getServerUser()
  if (!user || !["ADMIN", "OWNER"].includes(user.role)) {
    redirect("/moderation")
  }

  let products: any[] = []
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, email: true },
        },
        category: true,
        _count: { select: { reviews: true, favorites: true } },
      },
    })
  } catch (error) {
    console.error("Moderation products error:", error)
    products = []
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Review and moderate product listings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No products found.</p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {product.creator.displayName || product.creator.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.category?.name || "Uncategorized"} · {product._count.reviews} reviews
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={product.isPublished ? "default" : "secondary"}>
                        {product.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/product/${product.slug}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
