import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ShareButton } from "@/components/share-button"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const collection = await prisma.collection.findFirst({
    where: { slug: params.slug, isPublic: true },
    select: { name: true, description: true, user: { select: { username: true, displayName: true } } },
  })

  if (!collection) return { title: "Collection Not Found | PawVault" }

  const creatorName = collection.user.displayName || collection.user.username
  const description = collection.description || `${collection.name} — curated by ${creatorName} on PawVault.`

  return {
    title: `${collection.name} | PawVault`,
    description: description.slice(0, 160),
    openGraph: {
      title: collection.name,
      description: description.slice(0, 160),
      type: "website",
      url: `https://pawvault.com/collections/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: collection.name,
      description: description.slice(0, 160),
    },
  }
}

export default async function CollectionPage({
  params,
}: {
  params: { slug: string }
}) {
  const collection = await prisma.collection.findFirst({
    where: { slug: params.slug, isPublic: true },
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
    .filter((item) => item.product && item.product.isPublished)
    .map((item) => {
      const p = item.product!
      const avgRating = p.reviews.length > 0
        ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
        : 0

      return {
        ...p,
        rating: avgRating,
        reviewCount: p.reviews.length,
      }
    })

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
            <AdultContentPreview
              directUrl={collection.coverImage}
              contentRating="SFW"
              alt=""
              className="h-20 w-20 rounded-lg object-cover shrink-0"
              variant="image"
              aspect="square"
              showBadge={false}
            />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center text-3xl" role="img" aria-label="Collection cover">
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
                <AvatarImage src={collection.user.avatar || ""} alt={ownerName} />
                <AvatarFallback>{(ownerName)[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              {ownerName}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton url={`https://pawvault.com/store/${collection.user.username}/collection/${collection.slug}`} title={collection.name} />
          </div>
        </div>

        <nav className="mb-6">
          <Link href={`/store/${collection.user.username}`} className="text-sm text-rose-600 hover:underline">
            &larr; Back to {collection.user.displayName || collection.user.username}'s store
          </Link>
        </nav>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">This collection doesn't have any public products yet.</p>
              <Button asChild variant="outline">
                <Link href="/browse">Browse all products</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
