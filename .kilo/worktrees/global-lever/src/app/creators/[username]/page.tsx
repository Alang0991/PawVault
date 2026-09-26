export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/product-grid"
import { Rating } from "@/components/rating"
import { FollowButton } from "@/components/follow-button"
import { Store, ExternalLink, Calendar, Package, Users } from "lucide-react"
import { Metadata } from "next"
import { getServerUser } from "@/lib/session"
import { canSeeInternalAccounts } from "@/lib/roles"

interface Props {
  params: { username: string }
}

async function getCreator(username: string, role?: string | null) {
  const where: any = {
    username,
    creatorStatus: "APPROVED",
    status: "ACTIVE",
    store: {
      visibility: "PUBLISHED",
    },
  }
  if (!canSeeInternalAccounts(role)) {
    where.isInternal = false
  }

  const creator = await prisma.user.findFirst({
    where,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      isVerified: true,
      createdAt: true,
      salesCount: true,
      followersCount: true,
      rating: true,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          banner: true,
          logo: true,
          socialLinks: true,
        },
      },
      _count: {
        select: {
          products: {
            where: { isPublished: true },
          },
          followers: true,
        },
      },
    },
  })

  return creator
}

async function getCreatorProducts(creatorId: string) {
  return prisma.product.findMany({
    where: {
      creatorId,
      isPublished: true,
      status: "PUBLISHED",
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          store: {
            select: { slug: true },
          },
        },
      },
      category: true,
      media: {
        where: { isThumbnail: true },
        take: 1,
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  })
}

function parseSocialLinks(raw: string | null): Record<string, string> {
  if (!raw) return {}
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw
  } catch {
    return {}
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date)
}

async function generateCreatorMetadata(
  username: string,
  role?: string | null,
): Promise<Metadata> {
  const creator = await getCreator(username, role)

  if (!creator) {
    return {
      title: "Creator Not Found | PawVault",
      description: "This creator profile does not exist on PawVault.",
    }
  }

  const name = creator.displayName || creator.username
  const description = creator.bio || creator.store?.description || `Browse products by ${name} on PawVault.`
  const url = `https://pawvault.com/creators/${creator.username}`

  return {
    title: `${name} (@${creator.username}) | PawVault`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: name,
      description,
      url,
      type: "profile",
      locale: "en-US",
      ...(creator.avatar ? { images: creator.avatar } : {}),
    },
    twitter: {
      card: creator.avatar ? "summary_large_image" : "summary",
      title: name,
      description,
    },
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getServerUser()
  return generateCreatorMetadata(params.username, user?.role ?? null)
}

export default async function CreatorProfilePage({ params }: Props) {
  const user = await getServerUser()
  const creator = await getCreator(params.username, user?.role ?? null)

  if (!creator) {
    notFound()
  }

  const products = await getCreatorProducts(creator.id)
  const socialLinks = parseSocialLinks(creator.store?.socialLinks || null)
  const productCount = creator._count?.products ?? 0
  const followerCount = creator.followersCount ?? 0
  const name = creator.displayName || creator.username

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-600 to-rose-500">
        {creator.store?.banner && (
          <Image
            src={creator.store.banner}
            alt=""
            fill
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
              <AvatarImage src={creator.avatar || ""} alt={name} />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
                {name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 pt-4 md:pt-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
              {creator.isVerified && (
                <Badge variant="secondary" className="bg-info/10 text-info border-0">
                  <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">@{creator.username}</p>

            {creator.bio && (
              <p className="mt-3 text-sm max-w-2xl">{creator.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {formatDate(creator.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {productCount} product{productCount === 1 ? "" : "s"}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {followerCount} follower{followerCount === 1 ? "" : "s"}
              </div>
              {creator.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Rating rating={creator.rating} size="sm" showCount={false} />
                  <span>{creator.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <Button asChild className="gradient-bg text-white">
                <Link href={`/store/${creator.store?.slug || creator.username}`}>
                  <Store className="h-4 w-4 mr-2" />
                  View Store
                </Link>
              </Button>

              <FollowButton creatorId={creator.id} creatorName={name} />

              {Object.entries(socialLinks).map(([platform, url]) => (
                <Button key={platform} variant="outline" size="sm" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {platform}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          {creator.store?.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-muted-foreground">{creator.store.description}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Products</h2>
              {productCount > 12 && (
                <Button variant="link" asChild>
                  <Link href={`/store/${creator.store?.slug || creator.username}`}>
                    View all {productCount} products
                  </Link>
                </Button>
              )}
            </div>

            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No products yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
