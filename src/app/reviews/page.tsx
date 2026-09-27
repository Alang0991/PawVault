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
import { getServerCurrency } from "@/lib/currency-server"
import { EmptyState } from "@/components/empty-state"

export const dynamic = "force-dynamic"

export default async function MyReviewsPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const { locale: userLocale } = await getServerCurrency()
  const fmtDate = (d: Date | string) => formatDate(d, userLocale)

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
      <div className="pv-shell py-8 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-[32px]">
            Your reviews
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            What you&apos;ve said about products you&apos;ve bought.
          </p>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            icon={<Star className="h-6 w-6" />}
            title="Nothing here yet."
            description="Reviews you write on products you own will show up here."
            action={{ label: "Browse products", href: "/browse" }}
          />
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
                            {fmtDate(review.createdAt)}
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
