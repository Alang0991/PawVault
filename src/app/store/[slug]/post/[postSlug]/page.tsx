import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/helpers"
import { Calendar, User, ArrowLeft, ExternalLink } from "lucide-react"
import { ShareButton } from "@/components/share-button"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { sanitizePostContent, sanitizeSocialUrl } from "@/lib/sanitizer"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string; postSlug: string } }): Promise<Metadata> {
  const user = await prisma.user.findFirst({
    where: { username: params.slug },
    select: { id: true, username: true, displayName: true },
  })

  if (!user) return { title: "Post Not Found | PawVault" }

  const post = await prisma.post.findFirst({
    where: { slug: params.postSlug, userId: user.id, status: "PUBLISHED" },
    select: { title: true, excerpt: true, content: true, slug: true },
  })

  if (!post) return { title: "Post Not Found | PawVault" }

  const description = post.excerpt || post.content.replace(/<[^>]*>/g, "").slice(0, 160)

  return {
    title: `${post.title} | PawVault`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `https://pawvault.com/store/${user.username}/post/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  }
}

export default async function StorePostPage({
  params,
}: {
  params: { slug: string; postSlug: string }
}) {
  const user = await prisma.user.findFirst({
    where: { username: params.slug },
    select: { id: true, username: true, displayName: true, avatar: true },
  })

  if (!user) {
    notFound()
  }

  const post = await prisma.post.findFirst({
    where: {
      slug: params.postSlug,
      userId: user.id,
      status: "PUBLISHED",
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        },
      },
      product: {
        include: {
          media: {
            where: { isThumbnail: true },
            take: 1,
          },
          reviews: { select: { rating: true } },
          _count: { select: { favorites: true } },
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  const ownerName = post.user.displayName || post.user.username
  const sanitizedContent = sanitizePostContent(post.content)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href={`/store/${user.username}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to store
          </Link>
        </Button>

        <article className="prose dark:prose-invert max-w-none">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge variant="default" aria-label="Published">
                {post.status}
              </Badge>
              {post.contentRating !== "SFW" && (
                <Badge variant="destructive" aria-label="Mature content">18+</Badge>
              )}
              <ShareButton url={`https://pawvault.com/store/${user.username}/post/${post.slug}`} title={post.title} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <Link href={`/profile/${post.user.username}`} className="hover:text-foreground">
                  {ownerName}
                </Link>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
              </span>
            </div>
          </header>

          {post.image && (
            <div className="mb-8">
              <AdultContentPreview
                directUrl={post.image}
                contentRating={post.contentRating}
                alt={post.title}
                className="w-full max-h-96 object-cover rounded-lg"
                variant="image"
                aspect="video"
                showBadge={false}
              />
            </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {post.product && post.product.isPublished && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4">Featured Product</h3>
              <div className="max-w-sm">
                <ProductCard
                  product={{
                    id: post.product.id,
                    slug: post.product.slug,
                    title: post.product.title,
                    price: post.product.price,
                    media: post.product.media,
                    creator: post.user,
                    rating: post.product.reviews.length > 0
                      ? post.product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / post.product.reviews.length
                      : 0,
                    reviewCount: post.product.reviews.length,
                    _count: post.product._count,
                  }}
                />
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
