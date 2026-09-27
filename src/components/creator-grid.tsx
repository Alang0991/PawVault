import { CreatorCard } from "@/components/creator-card"
import { EmptyState } from "@/components/empty-state"

interface Creator {
  id: string
  username: string
  displayName?: string | null
  avatar?: string | null
  bio?: string | null
  isVerified?: boolean
  salesCount?: number
  rating?: number
  followersCount?: number
  store?: { name: string; slug: string; banner?: string | null } | null
  _count?: { products?: number }
}

/**
 * Grid of the shared CreatorCard. The card itself lives in
 * components/creator-card.tsx so the marketplace does not drift into
 * several slightly different creator tiles — see the design
 * direction §22.
 */
export function CreatorGrid({ creators }: { creators: Creator[] }) {
  if (creators.length === 0) {
    return <EmptyState title="No creators here yet." />
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} />
      ))}
    </div>
  )
}

CreatorGrid.displayName = "CreatorGrid"
