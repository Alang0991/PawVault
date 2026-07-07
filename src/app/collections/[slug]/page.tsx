import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CollectionPage({
  params,
}: {
  params: { slug: string }
}) {
  const collection = await prisma.collection.findFirst({
    where: { slug: params.slug },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        },
      },
      items: {
        orderBy: { order: "asc" },
        include: {
          product: {
            include: {
              creator: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                },
              },
              media: {
                where: { isThumbnail: true },
                take: 1,
              },
              reviews: { select: { rating: true } },
              _count: { select: { favorites: true, reviews: true } },
            },
          },
        },
      },
    },
  })

  if (!collection) {
    notFound()
  }

  const products = collection.items
    .map((item) => item.product)
    .filter(Boolean)
    .map((p: any) => ({
      ...p,
      rating:
        p.reviews.length > 0
          ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
          : 0,
      reviewCount: p.reviews.length,
    }))

  const ownerName =
    collection.user.displayName || collection.user.username

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <Link href="/browse" className="text-sm text-rose-600 hover:underline">
          &larr; Back to browse
        </Link>

        <div className="flex items-center gap-4 my-6">
          {collection.coverImage ? (
            <img
              src={collection.coverImage}
              alt=""
              className="h-20 w-20 rounded-lg object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center text-3xl">
              📚
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            {collection.description && (
              <p className="text-muted-foreground mt-1">{collection.description}</p>
            )}
            <Link
              href={`/profile/${collection.user.username}`}
              className="inline-flex items-center gap-2 mt-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={collection.user.avatar || ""} />
                <AvatarFallback>{(ownerName)[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              {ownerName}
            </Link>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              This collection is empty.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
