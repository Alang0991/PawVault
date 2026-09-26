import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Star, TrendingUp, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { ProductGrid } from "@/components/product-grid"

export const dynamic = "force-dynamic"

export default async function RecommendationsPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  let recs: any[] = []
  try {
    recs = await prisma.recommendation.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            creator: { select: { username: true, displayName: true } },
            media: { take: 1, where: { type: "image" } },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { score: "desc" },
      take: 24,
    })
  } catch (error) {
    console.error("Failed to fetch recommendations:", error)
  }

  const grouped: Record<string, any[]> = {}
  for (const r of recs) {
    const t = r.type || "similar"
    if (!grouped[t]) grouped[t] = []
    grouped[t].push(r)
  }

  const typeLabels: Record<string, string> = {
    similar: "Similar products",
    category: "Based on categories",
    purchase: "Based on purchases",
    wishlist: "Based on wishlist",
    follow: "Based on follows",
    trending: "Trending now",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" /> Recommendations
        </h1>
        <p className="text-muted-foreground mt-1">
          Products picked for you based on your activity.
        </p>
      </div>

      {recs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              No recommendations yet. Browse products to get personalized suggestions.
            </p>
            <Button asChild className="mt-4">
              <Link href="/browse">Browse marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {typeLabels[type] || type}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {items.length}
                </Badge>
              </div>
              <ProductGrid
                products={items.map((r) => ({
                  ...r.product,
                  _recommendation: { score: r.score, reason: r.reason },
                }))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}