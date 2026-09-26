import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  actionLabel,
  actionHref,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-text-muted">{icon}</span>}
        <h2 className="text-xl font-bold text-text-primary tracking-tight">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-sm text-text-muted sm:mt-0">
          {subtitle}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
        >
          {actionLabel}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

SectionHeader.displayName = "SectionHeader"
