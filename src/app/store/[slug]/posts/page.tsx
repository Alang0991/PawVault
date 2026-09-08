import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/helpers"
import { Calendar, User, FileText, ExternalLink } from "lucide-react"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { getServerUser } from "@/lib/session"

export const dynamic = "force-dynamic"

interface PostImageProps {
  src: string
  alt: string
  contentRating: "SFW" | "MATURE" | "NSFW"
  className?: string
}

function PostImage({ src, alt, contentRating, className }: PostImageProps) {
  return (
    <div className={"w-32 h-32 rounded-lg overflow-hidden bg-muted shrink-0 " + (className || "")}>
      <AdultContentPreview
        directUrl={src}
        contentRating={contentRating}
        alt={alt}
        className="w-full h-full"
        imgClassName="w-full h-full object-cover"
        variant="image"
        aspect="square"
        showBadge={false}
      />
    </div>
  )
}

export default async function StorePostsPage({
  params,
}: {
  params: { slug: string }
}) {
  const currentUser = await getServerUser()
  const isFounder = currentUser?.role === "FOUNDER"

  const user = await prisma.user.findFirst({
    where: { username: params.slug, ...(!isFounder && { isInternal: false }) },
    select: { id: true, username: true, displayName: true, avatar: true },
  })

  if (!user) {
    notFound()
  }

  const posts = await prisma.post.findMany({
    where: {
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
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          isPublished: true,
        },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  })

  const ownerName = user.displayName || user.username

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href={`/store/${user.username}`}>
            ← Back to store
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground mt-1">
            Updates and announcements from {ownerName}
          </p>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-sm">
                This creator has not published any posts yet. Check back later for updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <CardTitle className="truncate">
                          <Link href={`/store/${user.username}/post/${post.slug}`} className="hover:text-primary">
                            {post.title}
                          </Link>
                        </CardTitle>
                        {post.contentRating !== "SFW" && (
                          <Badge variant="destructive" aria-label="Mature content">18+</Badge>
                        )}
                      </div>
                      {post.excerpt && (
                        <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                        </span>
                        {post.product && post.product.isPublished && (
                          <Link href={`/product/${post.product.slug}`} className="flex items-center gap-1 hover:text-foreground">
                            <ExternalLink className="h-3 w-3" />
                            {post.product.title}
                          </Link>
                        )}
                      </div>
                    </div>
                    {post.image && (
                      <PostImage src={post.image} alt={post.title} contentRating={post.contentRating} />
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
