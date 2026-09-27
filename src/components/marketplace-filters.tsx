"use client"

import { useCallback, useMemo, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface CategoryOption {
  id: string
  name: string
  slug: string
}

export interface TagOption {
  id: string
  name: string
  slug: string
}

const RATING_OPTIONS = [
  { value: "3", label: "3+ stars" },
  { value: "4", label: "4+ stars" },
  { value: "4.5", label: "4.5+ stars" },
]

const FEATURE_OPTIONS = [
  { name: "pc", label: "PC" },
  { name: "quest", label: "Quest" },
  { name: "free", label: "Free" },
  { name: "onSale", label: "On sale" },
]

const EMPTY_VALUES = new Set(["", "any", "All", "0-any"])

interface MarketplaceFiltersProps {
  categories: CategoryOption[]
  tags: TagOption[]
  basePath?: string
  className?: string
}

/**
 * Marketplace filtering.
 *
 * Desktop gets a row of quiet chip-style dropdowns; mobile gets a single
 * Filters button that opens the same form in a dialog. Both write to the
 * same query string so a filtered view is always shareable — see the
 * design direction §7 and §19.
 */
export function MarketplaceFilters({
  categories,
  tags,
  basePath = "/browse",
  className,
}: MarketplaceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const params = useMemo(() => {
    const next = new URLSearchParams()
    searchParams.forEach((value, key) => next.set(key, value))
    return next
  }, [searchParams])

  const push = useCallback(
    (next: URLSearchParams) => {
      next.delete("page")
      const qs = next.toString()
      startTransition(() => {
        router.push(qs ? `${basePath}?${qs}` : basePath)
      })
    },
    [basePath, router]
  )

  /** Single-shot updates for the desktop chip dropdowns and filter chips. */
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params)
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || EMPTY_VALUES.has(value)) next.delete(key)
        else next.set(key, value)
      }
      push(next)
    },
    [params, push]
  )

  const setParam = useCallback(
    (key: string, value: string) => updateParams({ [key]: value }),
    [updateParams]
  )

  /** Full form submit: rebuild the query string from the form fields. */
  const applyForm = useCallback(
    (formData: FormData) => {
      const next = new URLSearchParams()
      const set = (key: string) => {
        const raw = formData.get(key)
        const value = typeof raw === "string" ? raw.trim() : ""
        if (!EMPTY_VALUES.has(value)) next.set(key, value)
      }

      set("q")
      set("creator")
      set("category")
      set("platform")
      set("priceMin")
      set("priceMax")
      set("rating")

      for (const option of FEATURE_OPTIONS) {
        set(option.name)
      }

      const selectedTags = formData.getAll("tags").filter(Boolean)
      if (selectedTags.length > 0) {
        next.set("tags", selectedTags.join(","))
      }

      // Sort is a view preference, not a filter — carry it across.
      const sort = formData.get("sort")
      if (typeof sort === "string" && sort) next.set("sort", sort)

      push(next)
    },
    [push]
  )

  const selectedTags = (params.get("tags") ?? "").split(",").filter(Boolean)
  const activeChips = buildActiveChips(params, categories, tags, updateParams)
  const hasFilters = activeChips.length > 0

  return (
    <div className={cn("space-y-3", className)}>
      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        <FilterSelect
          label="Category"
          value={params.get("category") ?? ""}
          onChange={(v) => setParam("category", v)}
          options={categories.map((c) => ({ value: c.slug, label: c.name }))}
        />
        <FilterSelect
          label="Price"
          value={priceValue(params)}
          onChange={(v) => {
            const next = new URLSearchParams(params)
            next.delete("priceMin")
            next.delete("priceMax")
            next.delete("free")
            if (v === "free") next.set("free", "true")
            else if (v) {
              const [min, max] = v.split("-")
              if (min) next.set("priceMin", min)
              if (max) next.set("priceMax", max)
            }
            push(next)
          }}
          options={[
            { value: "free", label: "Free" },
            { value: "0-10", label: "Under 10" },
            { value: "10-30", label: "10 – 30" },
            { value: "30-75", label: "30 – 75" },
            { value: "75-", label: "75 and over" },
          ]}
        />
        <FilterSelect
          label="Features"
          value={featuresValue(params)}
          onChange={(v) => {
            const next = new URLSearchParams(params)
            next.delete("pc")
            next.delete("quest")
            next.delete("onSale")
            if (v === "pc") next.set("pc", "true")
            if (v === "quest") next.set("quest", "true")
            if (v === "sale") next.set("onSale", "true")
            push(next)
          }}
          options={[
            { value: "pc", label: "PC" },
            { value: "quest", label: "Quest" },
            { value: "sale", label: "On sale" },
          ]}
        />
        <FilterSelect
          label="Rating"
          value={params.get("rating") ?? ""}
          onChange={(v) => setParam("rating", v)}
          options={RATING_OPTIONS}
        />

        <FilterDialog
          trigger={
            <Button variant="outline" size="sm" className="rounded-full font-normal">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              More filters
            </Button>
          }
          params={params}
          categories={categories}
          tags={tags}
          selectedTags={selectedTags}
          onApply={applyForm}
          onClear={() => router.push(basePath)}
        />
      </div>

      <div className="lg:hidden">
        <FilterDialog
          trigger={
            <Button variant="outline" size="sm" className="font-normal">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasFilters && (
                <span className="ml-1 rounded-full bg-accent px-1.5 text-[11px] text-accent-foreground">
                  {activeChips.length}
                </span>
              )}
            </Button>
          }
          params={params}
          categories={categories}
          tags={tags}
          selectedTags={selectedTags}
          onApply={applyForm}
          onClear={() => router.push(basePath)}
        />
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted">Active filters:</span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text-primary focus-ring"
            >
              {chip.label}
              <X className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Remove {chip.label} filter</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="text-xs text-text-muted underline-offset-4 transition-colors hover:text-text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

function FilterDialog({
  trigger,
  params,
  categories,
  tags,
  selectedTags,
  onApply,
  onClear,
}: {
  trigger: React.ReactNode
  params: URLSearchParams
  categories: CategoryOption[]
  tags: TagOption[]
  selectedTags: string[]
  onApply: (formData: FormData) => void
  onClear: () => void
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            onApply(new FormData(e.currentTarget))
          }}
        >
          <input type="hidden" name="sort" value={params.get("sort") ?? "newest"} />

          <div className="space-y-1.5">
            <Label htmlFor="filter-q" className="text-xs text-text-muted">
              Search
            </Label>
            <Input
              id="filter-q"
              name="q"
              defaultValue={params.get("q") ?? ""}
              placeholder="Search products..."
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-creator" className="text-xs text-text-muted">
              Creator
            </Label>
            <Input
              id="filter-creator"
              name="creator"
              defaultValue={params.get("creator") ?? ""}
              placeholder="Creator name or username"
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-category" className="text-xs text-text-muted">
              Category
            </Label>
            <select
              id="filter-category"
              name="category"
              defaultValue={params.get("category") ?? ""}
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm text-text-primary"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-platform" className="text-xs text-text-muted">
              Platform
            </Label>
            <Input
              id="filter-platform"
              name="platform"
              defaultValue={params.get("platform") ?? ""}
              placeholder="Windows, macOS, Blender..."
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="filter-price-min" className="text-xs text-text-muted">
                Min price
              </Label>
              <Input
                id="filter-price-min"
                name="priceMin"
                type="number"
                min={0}
                defaultValue={params.get("priceMin") ?? ""}
                placeholder="0"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-price-max" className="text-xs text-text-muted">
                Max price
              </Label>
              <Input
                id="filter-price-max"
                name="priceMax"
                type="number"
                min={0}
                defaultValue={params.get("priceMax") ?? ""}
                placeholder="Any"
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-rating" className="text-xs text-text-muted">
              Rating
            </Label>
            <select
              id="filter-rating"
              name="rating"
              defaultValue={params.get("rating") ?? ""}
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm text-text-primary"
            >
              <option value="">Any rating</option>
              {RATING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs text-text-muted">Availability</legend>
            <div className="flex flex-wrap gap-4">
              {FEATURE_OPTIONS.map((opt) => (
                <label key={opt.name} className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    name={opt.name}
                    value="true"
                    defaultChecked={params.get(opt.name) === "true"}
                    className="accent-accent"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {tags.length > 0 && (
            <fieldset className="space-y-2">
              <legend className="text-xs text-text-muted">Tags</legend>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => {
                  const active = selectedTags.includes(t.slug)
                  return (
                    <label key={t.id} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="tags"
                        value={t.slug}
                        defaultChecked={active}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "inline-block rounded-full border px-2.5 py-1 text-xs transition-colors",
                          active
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border text-text-secondary hover:border-accent/50"
                        )}
                      >
                        {t.name}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClear}>
              Clear all
            </Button>
            <DialogClose asChild>
              <Button type="submit">Apply filters</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Compact select styled as a chip trigger — the desktop filter row. */
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  const id = `filter-${label.toLowerCase()}`
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent/50 focus-ring"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </>
  )
}

interface ActiveChip {
  key: string
  label: string
  clear: () => void
}

function buildActiveChips(
  params: URLSearchParams,
  categories: CategoryOption[],
  tags: TagOption[],
  updateParams: (updates: Record<string, string | null>) => void,
): ActiveChip[] {
  const chips: ActiveChip[] = []
  const clear = (key: string) => () => updateParams({ [key]: null })

  const q = params.get("q")
  if (q) chips.push({ key: "q", label: `“${q}”`, clear: clear("q") })

  const creator = params.get("creator")
  if (creator) chips.push({ key: "creator", label: creator, clear: clear("creator") })

  const category = params.get("category")
  if (category) {
    const name = categories.find((c) => c.slug === category)?.name ?? category
    chips.push({ key: "category", label: name, clear: clear("category") })
  }

  const platform = params.get("platform")
  if (platform) chips.push({ key: "platform", label: platform, clear: clear("platform") })

  const min = params.get("priceMin")
  const max = params.get("priceMax")
  if (min || max) {
    chips.push({
      key: "price",
      label: `${min ?? "0"} – ${max ?? "any"}`,
      clear: () => updateParams({ priceMin: null, priceMax: null }),
    })
  }

  for (const option of FEATURE_OPTIONS) {
    if (params.get(option.name) === "true") {
      chips.push({
        key: option.name,
        label: option.label,
        clear: clear(option.name),
      })
    }
  }

  const rating = params.get("rating")
  if (rating) {
    chips.push({ key: "rating", label: `${rating}+ stars`, clear: clear("rating") })
  }

  const selectedTags = (params.get("tags") ?? "").split(",").filter(Boolean)
  for (const slug of selectedTags) {
    const name = tags.find((t) => t.slug === slug)?.name ?? slug
    chips.push({
      key: `tag-${slug}`,
      label: name,
      clear: () =>
        updateParams({
          tags: selectedTags.filter((s) => s !== slug).join(","),
        }),
    })
  }

  return chips
}

function priceValue(params: URLSearchParams): string {
  if (params.get("free") === "true") return "free"
  const min = params.get("priceMin")
  const max = params.get("priceMax")
  if (!min && !max) return ""
  return `${min ?? "0"}-${max ?? ""}`
}

function featuresValue(params: URLSearchParams): string {
  if (params.get("pc") === "true") return "pc"
  if (params.get("quest") === "true") return "quest"
  if (params.get("onSale") === "true") return "sale"
  return ""
}
