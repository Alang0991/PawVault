import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CommissionsBandProps {
  title: string
  body: string
  actionLabel: string
  actionHref: string
}

/**
 * Commissions are a primary differentiator, so the homepage gets one
 * dedicated band rather than a buried link — see the design direction
 * §4 and §10. Kept as a single quiet band, not a feature-card grid.
 */
export function CommissionsBand({
  title,
  body,
  actionLabel,
  actionHref,
}: CommissionsBandProps) {
  return (
    <section className="pv-commissions">
      <div className="pv-shell flex flex-col gap-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-14">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-[28px]">
            {title}
          </h2>
          <p className="mt-2 text-base text-text-secondary">{body}</p>
        </div>
        <Button asChild className="h-11 shrink-0 px-6 sm:self-start">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </div>
    </section>
  )
}
