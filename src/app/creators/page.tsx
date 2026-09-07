export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { SectionHeader } from "@/components/section-header"
import { CreatorCard } from "@/components/creator-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Package, Store, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

const PAGE_SIZE = 24

async function getCreators(sort: string = "sales", cursor?: string) {
  const orderBy: Record<string, object> = {
    sales: { salesCount: "desc" as const },
    newest: { createdAt: "desc" as const },
    followers: { followersCount: "desc" as const },
    rating: { rating: "desc" as const },
  }

  const creators = await prisma.user.findMany({
    where: {
      creatorStatus: "APPROVED",
      status: "ACTIVE",
      store: {
        visibility: "PUBLISHED",
      },
    },
    include: {
      store: {
        select: {
          id: true,
          slug: true,
          name: true,
          banner: true,
          visibility: true,
        },
      },
      _count: {
        select: {
          products: { where: { isPublished: true } },
          followers: true,
        },
      },
    },
    orderBy: orderBy[sort] || orderBy.sales,
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = creators.length > PAGE_SIZE
  const items = hasMore ? creators.slice(0, -1) : creators
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

  return { creators: items, hasMore, nextCursor }
}

async function getTotalCounts() {
  const [creatorCount, productCount, followerCount] = await Promise.all([
    prisma.user.count({
      where: {
        creatorStatus: "APPROVED",
        status: "ACTIVE",
        store: { visibility: "PUBLISHED" },
      },
    }),
    prisma.product.count({
      where: {
        isPublished: true,
        creator: {
          creatorStatus: "APPROVED",
          status: "ACTIVE",
          store: { visibility: "PUBLISHED" },
        },
      },
    }),
    prisma.follower.count({
      where: {
        following: {
          creatorStatus: "APPROVED",
          status: "ACTIVE",
          store: { visibility: "PUBLISHED" },
        },
      },
    }),
  ])

  return { creatorCount, productCount, followerCount }
}

export default async function CreatorsPage({ searchParams }: Props) {
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "sales"
  const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : undefined

  const [{ creators, hasMore, nextCursor }, { creatorCount, productCount, followerCount }] =
    await Promise.all([getCreators(sort, cursor), getTotalCounts()])

  const sortOptions = [
    { value: "sales", label: "Top Sales" },
    { value: "newest", label: "Newest" },
    { value: "followers", label: "Most Followed" },
    { value: "rating", label: "Highest Rated" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <SectionHeader
          title="Creators"
          subtitle="Meet the talented artists and developers behind the assets"
          icon={<Store className="h-5 w-5 text-text-muted" />}
        />

        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <Badge variant="subtle" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {creatorCount} creator{creatorCount === 1 ? "" : "s"}
            </Badge>
            <Badge variant="subtle" className="gap-1.5">
              <Package className="h-3.5 w-3.5" />
              {productCount} published product{productCount === 1 ? "" : "s"}
            </Badge>
            <Badge variant="subtle" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {followerCount} follower{followerCount === 1 ? "" : "s"}
            </Badge>
          </div>

          <div className="flex gap-2">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sort === option.value ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={`/creators?sort=${option.value}`}>
                  {option.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {creators.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <Store className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No creators have joined yet. Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              {cursor && (
                <Button variant="outline" asChild>
                  <Link href={`/creators?sort=${sort}`}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Link>
                </Button>
              )}
              {hasMore && (
                <Button variant="outline" asChild>
                  <Link href={`/creators?sort=${sort}&cursor=${nextCursor}`}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
