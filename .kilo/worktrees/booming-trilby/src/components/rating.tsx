import { cn } from "@/lib/utils"

interface RatingProps {
  rating: number
  reviewCount?: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  className?: string
}

export function Rating({
  rating,
  reviewCount,
  size = "md",
  showCount = true,
  className,
}: RatingProps) {
  const sizeConfig = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }
  const iconSize = sizeConfig[size]
  const stars = Math.min(5, Math.max(0, Math.round(rating)))

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={i < stars ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={i < stars ? 0 : 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "text-amber-400",
              iconSize
            )}
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <span className="text-xs text-text-muted">
          ({reviewCount})
        </span>
      )}
    </div>
  )
}

Rating.displayName = "Rating"
