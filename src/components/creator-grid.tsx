import Link from "next/link"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rating } from "@/components/rating"
import { FollowButton } from "@/components/follow-button"

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

export function CreatorGrid({ creators }: { creators: Creator[] }) {
  if (creators.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No creators found.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} />
      ))}
    </div>
  )
}

function CreatorCard({ creator }: { creator: Creator }) {
  const name = creator.displayName || creator.username
  const storeSlug = creator.store?.slug || creator.username
  const productCount = creator._count?.products ?? 0

  return (
    <div className="group block rounded-lg border bg-surface p-4 transition-all duration-200 hover:border-accent hover:shadow-card-hover">
      <div className="flex flex-col items-center text-center">
        <Link href={`/creators/${creator.username}`}>
          <Avatar className="h-14 w-14 border-2 border-background cursor-pointer hover:ring-2 hover:ring-accent transition-all">
            <AvatarImage src={creator.avatar || ""} alt={name} />
            <AvatarFallback className="text-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-semibold">
              {name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="mt-2 flex items-center gap-1 justify-center flex-wrap">
          <Link href={`/creators/${creator.username}`} className="hover:underline">
            <span className="font-medium text-sm text-text-primary truncate">{name}</span>
          </Link>
          {creator.isVerified && (
            <Badge variant="secondary" size="sm" className="rounded-full bg-info/10 text-info border-0">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </Badge>
          )}
        </div>

        {creator.rating !== undefined && creator.rating > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <Rating rating={creator.rating} size="sm" showCount={false} />
            <span className="text-xs text-text-muted">{creator.rating.toFixed(1)}</span>
          </div>
        )}

        <p className="mt-2 text-xs text-text-secondary line-clamp-2 min-h-[36px]">
          {creator.bio || `${creator.salesCount ?? 0} sales · ${creator.followersCount ?? 0} followers`}
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs text-text-muted">
          {productCount > 0 && <span>{productCount} product{productCount === 1 ? "" : "s"}</span>}
          {creator.salesCount! > 0 && <span>{creator.salesCount} sales</span>}
        </div>

        <Button asChild variant="outline" size="sm" className="mt-3 w-full group-hover:bg-accent group-hover:text-accent-foreground">
          <Link href={`/store/${storeSlug}`}>
            View store
          </Link>
        </Button>
      </div>
    </div>
  )
}

CreatorGrid.displayName = "CreatorGrid"