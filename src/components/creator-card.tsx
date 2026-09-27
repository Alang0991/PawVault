import Link from "next/link"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Rating } from "@/components/rating"

interface CreatorCardProps {
  creator: {
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
  className?: string
}

/**
 * Creator card: image, identity, and the two numbers a buyer actually
 * uses to judge someone — rating and how much they have sold. No
 * gradient fallback, no hover ring, no oversized CTA. See the design
 * direction §14.
 */
export function CreatorCard({ creator, className }: CreatorCardProps) {
  const name = creator.displayName || creator.username
  const storeSlug = creator.store?.slug || creator.username
  const productCount = creator._count?.products ?? 0
  const sales = creator.salesCount ?? 0

  return (
    <div
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/40",
        className
      )}
    >
      <Link href={`/creators/${creator.username}`} className="flex items-center gap-3 focus-ring rounded-lg">
        <Avatar className="h-11 w-11 shrink-0">
          <AvatarImage src={creator.avatar || ""} alt={name} />
          <AvatarFallback className="bg-muted text-sm font-semibold text-text-secondary">
            {name[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-text-primary">
              {name}
            </span>
            {creator.isVerified && (
              <span className="shrink-0 text-[11px] font-bold text-info" aria-label="Verified">
                ✓
              </span>
            )}
          </p>
          <p className="truncate text-xs text-text-muted">@{creator.username}</p>
        </div>
      </Link>

      {creator.rating !== undefined && creator.rating > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
          <Rating rating={creator.rating} size="sm" showCount={false} />
          <span>{creator.rating.toFixed(1)}</span>
        </p>
      )}

      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-text-secondary">
        {creator.bio}
      </p>

      <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-xs text-text-muted">
        {productCount > 0 && <span>{productCount} products</span>}
        {sales > 0 && <span>{sales} sales</span>}
      </div>

      <Link
        href={`/store/${storeSlug}`}
        className="mt-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        View store →
      </Link>
    </div>
  )
}

CreatorCard.displayName = "CreatorCard"
