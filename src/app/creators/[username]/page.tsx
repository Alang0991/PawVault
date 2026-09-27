export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/product-grid"
import { SectionHeader } from "@/components/section-header"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { Rating } from "@/components/rating"
import { FollowButton } from "@/components/follow-button"
import { Metadata } from "next"
import { getServerUser } from "@/lib/session"
import { canSeeInternalAccounts } from "@/lib/roles"
import { formatDate } from "@/lib/currency"
import { formatCount } from "@/lib/format"
import { getServerCurrency } from "@/lib/currency-server"

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
  const products = await prisma.product.findMany({
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
      reviews: { select: { rating: true } },
      _count: {
        select: {
          reviews: true,
          favorites: true,
          downloads: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  })

  return products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
        : 0
    return {
      ...p,
      rating: avgRating,
      reviewCount: p.reviews.length,
      salesCount: p._count?.downloads ?? 0,
    }
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
  const { locale: userLocale } = await getServerCurrency()
  const fmtDate = (d: Date | string) => formatDate(d, userLocale)

  const [featured, rest] = partitionFeatured(products)

  return (
    <div className="min-h-screen bg-background">
      {/* Banner: the creator's own image, or a quiet neutral placeholder */}
      <div className="relative h-40 bg-surface-subtle md:h-56">
        {creator.store?.banner && (
          <Image
            src={creator.store.banner}
            alt=""
            fill
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="pv-shell">
        <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 md:flex-row md:items-end md:gap-6">
          <Avatar className="h-24 w-24 shrink-0 border-4 border-background md:h-32 md:w-32">
            <AvatarImage src={creator.avatar || ""} alt={name} />
            <AvatarFallback className="bg-muted text-3xl font-semibold text-text-secondary">
              {name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pb-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
              {name}
              {creator.isVerified && <StatusBadge type="verified" />}
            </h1>
            <p className="text-sm text-text-muted">@{creator.username}</p>

            {creator.bio && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
                {creator.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <FollowButton creatorId={creator.id} creatorName={name} />
              <Button asChild variant="outline" size="sm">
                <Link href={`/store/${creator.store?.slug || creator.username}`}>
                  View store
                </Link>
              </Button>
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Stats: plain numbers, no decorative icons */}
        <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border py-4 text-sm">
          <div className="flex items-center gap-1.5">
            <dt className="text-text-muted">Products</dt>
            <dd className="font-medium text-text-primary">
              {formatCount(productCount)}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-text-muted">Followers</dt>
            <dd className="font-medium text-text-primary">
              {formatCount(followerCount)}
            </dd>
          </div>
          {creator.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <dt className="text-text-muted">Rating</dt>
              <dd className="flex items-center gap-1.5 font-medium text-text-primary">
                <Rating rating={creator.rating} size="sm" showCount={false} />
                {creator.rating.toFixed(1)}
              </dd>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <dt className="text-text-muted">Joined</dt>
            <dd className="font-medium text-text-primary">
              {fmtDate(creator.createdAt)}
            </dd>
          </div>
        </dl>

        {featured.length > 0 && (
          <section className="mt-10">
            <SectionHeader title="Featured" />
            <ProductGrid products={featured} />
          </section>
        )}

        <section className="mt-12">
          <SectionHeader
            title="Products"
            actionLabel={
              productCount > products.length
                ? `View all ${formatCount(productCount)}`
                : undefined
            }
            actionHref={`/store/${creator.store?.slug || creator.username}`}
          />

          {products.length > 0 ? (
            <ProductGrid products={rest.length > 0 ? rest : products} />
          ) : (
            <EmptyState
              title="Nothing here yet."
              description={`${name} hasn’t published any products yet.`}
            />
          )}
        </section>

        {creator.store?.description && (
          <section className="mt-12 max-w-2xl">
            <SectionHeader title="About" />
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
              {creator.store.description}
            </p>
          </section>
        )}
      </div>
    </div>
  )
}

/** The three most favourited products lead the profile; the rest follow. */
function partitionFeatured(products: any[]) {
  const FEATURED_COUNT = 3
  const sorted = [...products].sort(
    (a, b) => (b._count?.favorites ?? 0) - (a._count?.favorites ?? 0)
  )
  return [sorted.slice(0, FEATURED_COUNT), sorted.slice(FEATURED_COUNT)]
}
