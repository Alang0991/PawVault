import { cn } from "@/lib/utils"

export interface StatTileProps {
  label: string
  value: string
  hint?: string
  href?: string
  className?: string
}

/**
 * A single number a creator actually acts on.
 *
 * Deliberately not a card with a coloured icon tile in it — the number
 * and its label are the whole component. See the design direction §14
 * (use a small number of card styles) and §1 (nothing decorative).
 */
export function StatTile({
  label,
  value,
  hint,
  href,
  className,
}: StatTileProps) {
  const content = (
    <>
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-text-primary">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-text-muted">{hint}</p>}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          "rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40 focus-ring",
          className
        )}
      >
        {content}
      </a>
    )
  }

  return (
    <div
      className={cn("rounded-xl border border-border bg-surface p-4", className)}
    >
      {content}
    </div>
  )
}

/** Row of stat tiles. */
export function StatGrid({
  stats,
  columns = 4,
  className,
}: {
  stats: StatTileProps[]
  columns?: 2 | 3 | 4
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 4
          ? "grid-cols-2 lg:grid-cols-4"
          : columns === 3
            ? "grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2",
        className
      )}
    >
      {stats.map((stat) => (
        <StatTile key={stat.label} {...stat} />
      ))}
    </div>
  )
}
