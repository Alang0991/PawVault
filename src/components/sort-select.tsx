"use client"

import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/hooks/use-translation"

const SORT_OPTIONS = [
  { value: "trending", translationKey: "marketplace.sortTrending", fallback: "Trending" },
  { value: "newest", translationKey: "marketplace.sortNewest", fallback: "Newest" },
  { value: "price-asc", translationKey: "marketplace.sortPriceLow", fallback: "Price: Low to High" },
  { value: "price-desc", translationKey: "marketplace.sortPriceHigh", fallback: "Price: High to Low" },
  { value: "rating", translationKey: "marketplace.sortRating", fallback: "Highest Rated" },
] as const

/**
 * Sort control. Trending leads because it is the marketplace default —
 * see the design direction §5 and §7.
 */
export function SortSelect({
  current,
  params,
  basePath = "/browse",
}: {
  current: string
  params: Record<string, string | undefined>
  basePath?: string
}) {
  const router = useRouter()
  const { t } = useTranslation()

  const onChange = (value: string) => {
    const next = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    )
    next.set("sort", value)
    next.delete("page")
    const qs = next.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath)
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="sort-select" className="text-sm text-text-muted">
        {(t("marketplace.sortBy") as string) || "Sort"}
      </Label>
      <select
        id="sort-select"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent/50 focus-ring"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {(t(option.translationKey) as string) || option.fallback}
          </option>
        ))}
      </select>
    </div>
  )
}
