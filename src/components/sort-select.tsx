"use client"

import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "best-selling", label: "Best Selling" },
  { value: "rating", label: "Highest Rated" },
]

export function SortSelect({
  current,
  params,
}: {
  current: string
  params: Record<string, string | undefined>
}) {
  const router = useRouter()

  const onChange = (value: string) => {
    const next = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    )
    next.set("sort", value)
    next.delete("page")
    const qs = next.toString()
    router.push(qs ? `/browse?${qs}` : "/browse")
  }

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm">Sort by</Label>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
