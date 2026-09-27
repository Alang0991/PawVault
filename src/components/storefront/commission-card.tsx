import Image from "next/image"
import Link from "next/link"
import { Rating } from "@/components/rating"
import { formatCount } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * A commission listing, normalised across the three commission models
 * (ServiceProvider, AvatarCommissioner, ArtCommissioner) so a creator
 * with more than one kind of service still renders as one consistent
 * card — see the design direction §10 and §22.
 */
export interface CommissionListing {
  id: string
  title: string
  description?: string | null
  whatTheyMake: string[]
  startingPrice?: number | null
  priceLabel?: string | null
  turnaroundDays?: number | null
  portfolioImages: string[]
  rating: number
  reviewCount: number
  completedOrders: number
  availability: string
  openSlots?: number | null
  tags: string[]
  href?: string
}

const AVAILABILITY_LABELS: Record<string, string> = {
  open: "Open for work",
  limited: "Limited availability",
  closed: "Booked up",
  unavailable: "Unavailable",
}

const AVAILABILITY_TONES: Record<string, string> = {
  open: "text-success",
  limited: "text-warning",
  closed: "text-text-muted",
  unavailable: "text-text-muted",
}

export function CommissionCard({
  listing,
  className,
}: {
  listing: CommissionListing
  className?: string
}) {
  const {
    title,
    description,
    whatTheyMake,
    startingPrice,
    priceLabel,
    turnaroundDays,
    portfolioImages,
    rating,
    reviewCount,
    completedOrders,
    availability,
    openSlots,
    tags,
    href,
  } = listing

  const cover = portfolioImages[0]
  const availabilityKey = availability?.toLowerCase() ?? "closed"

  const body = (
    <>
      {/* Portfolio preview leads, same as a product card */}
      <div className="pv-product-media aspect-[16/9] w-full">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <span className="text-xs">No portfolio yet</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-text-primary">
          {title}
        </h3>

        {whatTheyMake.length > 0 && (
          <p className="truncate text-xs text-text-muted">{whatTheyMake.join(" · ")}</p>
        )}

        {rating > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-text-muted">
            <Rating rating={rating} size="sm" showCount={false} />
            <span>{rating.toFixed(1)}</span>
            {reviewCount > 0 && <span>({formatCount(reviewCount)})</span>}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold text-text-primary">
            {priceLabel ?? (startingPrice ? `From ${startingPrice}` : "Contact for pricing")}
          </span>
          {typeof turnaroundDays === "number" && (
            <span className="text-xs text-text-muted">
              {turnaroundDays <= 1
                ? "Under a week"
                : turnaroundDays < 14
                  ? `${turnaroundDays} days`
                  : `${Math.round(turnaroundDays / 7)} weeks`}
            </span>
          )}
        </div>

        <p className="flex items-center gap-2 text-xs">
          <span className={cn("font-medium", AVAILABILITY_TONES[availabilityKey])}>
            {AVAILABILITY_LABELS[availabilityKey] ?? "Availability varies"}
          </span>
          {typeof openSlots === "number" && availabilityKey === "open" && openSlots > 0 && (
            <span className="text-text-muted">
              · {openSlots} {openSlots === 1 ? "slot" : "slots"} left
            </span>
          )}
          {completedOrders > 0 && (
            <span className="text-text-muted">
              · {formatCount(completedOrders)} completed
            </span>
          )}
        </p>

        {description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
            {description}
          </p>
        )}

        {tags.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn("group block rounded-xl focus-ring", className)}
      >
        {body}
      </Link>
    )
  }

  return <div className={cn("group", className)}>{body}</div>
}

export { AVAILABILITY_LABELS }
