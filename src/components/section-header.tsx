import Link from "next/link"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

/**
 * One section heading for the whole marketplace: title, optional
 * subtitle, optional text action. No icons, no badges — the heading
 * and the products underneath it are enough. See the design
 * direction §12 for the type scale and §6 for card restraint.
 */
export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-[28px]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="shrink-0 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          {actionLabel} →
        </Link>
      )}
    </div>
  )
}

SectionHeader.displayName = "SectionHeader"
