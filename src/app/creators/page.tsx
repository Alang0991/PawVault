export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { SectionHeader } from "@/components/section-header"
import { CreatorCard } from "@/components/creator-card"
import { Badge } from "@/components/ui/badge"
import { Users, Package, Store } from "lucide-react"

async function getCreators() {
  return prisma.user.findMany({
    where: {
      role: { in: ["CREATOR", "VERIFIED_CREATOR"] },
      status: "ACTIVE",
    },
    include: {
      _count: {
        select: {
          products: { where: { isPublished: true } },
          followers: true,
        },
      },
    },
    orderBy: {
      salesCount: "desc",
    },
  })
}

export default async function CreatorsPage() {
  const creators = await getCreators()

  const totalProducts = creators.reduce(
    (sum, c) => sum + (c._count.products ?? 0),
    0
  )
  const totalFollowers = creators.reduce(
    (sum, c) => sum + (c._count.followers ?? 0),
    0
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <SectionHeader
          title="Creators"
          subtitle="Meet the talented artists and developers behind the assets"
          icon={<Store className="h-5 w-5 text-text-muted" />}
        />

        <div className="mb-8 flex flex-wrap gap-4">
          <Badge variant="subtle" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {creators.length} creator
            {creators.length === 1 ? "" : "s"}
          </Badge>
          <Badge variant="subtle" className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            {totalProducts} published product
            {totalProducts === 1 ? "" : "s"}
          </Badge>
          <Badge variant="subtle" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {totalFollowers} follower
            {totalFollowers === 1 ? "" : "s"}
          </Badge>
        </div>

        {creators.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <Store className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No creators have joined yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
