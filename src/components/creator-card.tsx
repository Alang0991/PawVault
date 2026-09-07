import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  featured?: boolean
  className?: string
}

export function CreatorCard({ creator, featured, className }: CreatorCardProps) {
  const name = creator.displayName || creator.username
  const storeSlug = creator.store?.slug || creator.username
  const productCount = creator._count?.products ?? 0
  const sales = creator.salesCount ?? 0
  const followers = creator.followersCount ?? 0

  return (
    <Link
      href={`/store/${storeSlug}`}
      className={cn(
        "group block rounded-lg border bg-surface p-6 transition-all duration-200 hover:border-accent hover:shadow-card-hover",
        featured && "md:col-span-2 lg:col-span-1",
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-16 w-16 border-2 border-background">
          <AvatarImage src={creator.avatar || ""} alt={name} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-semibold">
            {name[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="mt-3 flex items-center gap-1.5 justify-center flex-wrap">
          <span className="font-semibold text-sm text-text-primary">
            {name}
          </span>
          {creator.isVerified && (
            <Badge
              variant="secondary"
              size="sm"
              className="rounded-full bg-info/10 text-info border-0"
            >
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </Badge>
          )}
        </div>

        {creator.rating !== undefined && creator.rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <Rating rating={creator.rating} size="sm" showCount={false} />
            <span className="text-xs text-text-muted">
              {creator.rating.toFixed(1)}
            </span>
          </div>
        )}

        <p className="mt-2 text-xs text-text-secondary line-clamp-2 min-h-[36px]">
          {creator.bio || `${sales} sales · ${followers} followers`}
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-text-muted">
          {productCount > 0 && (
            <span>{productCount} product{productCount === 1 ? "" : "s"}</span>
          )}
          {sales > 0 && <span>{sales} sales</span>}
          {followers > 0 && <span>{followers} followers</span>}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full group-hover:bg-accent group-hover:text-accent-foreground"
        >
          View store
        </Button>
      </div>
    </Link>
  )
}

CreatorCard.displayName = "CreatorCard"
