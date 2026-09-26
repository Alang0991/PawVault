import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"

async function getWishlist(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
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
          media: { where: { isThumbnail: true }, take: 1 },
          reviews: { select: { rating: true } },
          _count: { select: { favorites: true, reviews: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return items
    .filter((item) => item.product && item.product.isPublished)
    .map((item) => {
      const p = item.product as any
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
          : 0
      return { ...p, rating: avgRating, reviewCount: p.reviews.length }
    })
}

export default async function WishlistPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const products = await getWishlist(user.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Wishlist</h1>
          <p className="text-sm text-text-secondary mt-1">
            {products.length}{" "}
            {products.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-text-muted" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Nothing saved yet.
            </h2>
            <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
              Find something worth keeping and it will appear here.
            </p>
            <Button asChild>
              <Link href="/browse">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  )
}
