import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Star, ExternalLink } from "lucide-react"
import Image from "next/image"
import { formatDate } from "@/lib/helpers"

export const dynamic = "force-dynamic"

export default async function MyReviewsPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          media: { where: { isThumbnail: true }, take: 1 },
          creator: { select: { id: true, username: true, displayName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">My Reviews</h1>
          <p className="text-sm text-text-secondary mt-1">
            Reviews you&apos;ve written for products you&apos;ve purchased.
          </p>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-10 w-10 mx-auto mb-4 text-text-muted" />
              <p className="text-text-secondary">You haven&apos;t written any reviews yet.</p>
              <Button asChild className="mt-4">
                <Link href="/browse">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => {
              const product = review.product
              const thumbnail = product.media[0]
              const creatorName =
                product.creator.displayName || product.creator.username

              return (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded border bg-surface-subtle">
                        {thumbnail ? (
                          <Image
                            src={thumbnail.url}
                            alt={product.title}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-text-muted">
                            <Star className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/product/${product.slug}`}
                              className="font-medium text-text-primary hover:text-accent transition-colors line-clamp-1"
                            >
                              {product.title}
                            </Link>
                            <p className="text-xs text-text-muted mt-0.5">
                              by {creatorName}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {review.title && (
                          <p className="font-medium text-sm text-text-primary mt-2">
                            {review.title}
                          </p>
                        )}
                        {review.content && (
                          <p className="text-sm text-text-secondary mt-1">
                            {review.content}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs text-text-muted">
                            {formatDate(review.createdAt)}
                          </span>
                          {review.isVerified && (
                            <Badge variant="outline" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
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
