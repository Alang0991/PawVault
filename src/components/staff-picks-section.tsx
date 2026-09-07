import Link from "next/link"
import { Star } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { SectionHeader } from "@/components/section-header"
import { EmptyState } from "@/components/empty-state"

interface StaffPick {
  id: string
  note: string | null
  createdAt: string
  product: {
    id: string
    slug: string
    title: string
    price: number
    salePrice?: number | null
    isOnSale?: boolean
    isFree?: boolean
    contentRating?: string
    media?: { id?: string; url: string }[]
    creator: {
      id: string
      username?: string
      displayName?: string | null
      avatar?: string | null
      isVerified?: boolean
    }
    rating?: number
    reviewCount?: number
  }
  staff: {
    username: string
    displayName?: string | null
  }
}

export function StaffPicksSection({ picks }: { picks: StaffPick[] }) {
  if (picks.length === 0) return null

  return (
    <section>
      <SectionHeader
        title="Staff Picks"
        subtitle="Hand-picked by the PawVault team"
        icon={<Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
        actionLabel="See all"
        actionHref="/browse?staff-picks=true"
      />
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {picks.slice(0, 8).map((pick) => (
          <div key={pick.id} className="relative">
            <ProductCard product={pick.product} />
            {pick.note && (
              <p className="mt-2 text-xs text-text-muted line-clamp-1">
                <span className="text-amber-400 font-medium">Staff pick: </span>
                {pick.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export async function getStaffPicks(): Promise<StaffPick[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/staff-picks`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.picks || []
  } catch {
    return []
  }
}