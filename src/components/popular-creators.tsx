import { CreatorCard } from "@/components/creator-card"
import { SectionHeader } from "@/components/section-header"

interface PopularCreatorsProps {
  creators: any[]
  title: string
  subtitle?: string
  actionLabel?: string
  actionHref?: string
}

/**
 * Popular creators, ranked from live marketplace signals rather
 * than hand-picked by staff — see the design direction §5.
 */
export function PopularCreators({
  creators,
  title,
  subtitle,
  actionLabel,
  actionHref,
}: PopularCreatorsProps) {
  if (creators.length === 0) return null

  return (
    <section className="pv-section">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        actionHref={actionHref}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>
    </section>
  )
}
