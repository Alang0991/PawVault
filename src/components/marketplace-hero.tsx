import Link from "next/link"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"

interface MarketplaceHeroProps {
  eyebrow: string
  heading: string
  description: string
  searchPlaceholder: string
  browseLabel: string
  browseHref: string
  sellLabel: string
  sellHref: string
  browseAllCategoriesLabel: string
  categories: { id: string; name: string; slug: string }[]
}

/**
 * Homepage hero.
 *
 * The marketplace should be legible before anything else renders:
 * what PawVault is, one line of plain copy, search, and the
 * category entry points. No decorative artwork, no badges, no
 * floating shapes — see docs/PawVault_UI_UX_Design_Direction.md §4.
 */
export function MarketplaceHero({
  eyebrow,
  heading,
  description,
  searchPlaceholder,
  browseLabel,
  browseHref,
  sellLabel,
  sellHref,
  browseAllCategoriesLabel,
  categories,
}: MarketplaceHeroProps) {
  return (
    <section className="pv-hero">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-text-muted">{eyebrow}</p>

        <h1 className="pv-hero-heading mt-3">{heading}</h1>

        <p className="pv-hero-sub mt-4">{description}</p>

        <div className="mt-8 max-w-xl">
          <SearchBar placeholder={searchPlaceholder} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11 px-6">
            <Link href={browseHref}>{browseLabel}</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-6">
            <Link href={sellHref}>{sellLabel}</Link>
          </Button>
        </div>
      </div>

      {categories.length > 0 && (
        <nav aria-label={browseAllCategoriesLabel} className="mt-12">
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/categories/${category.slug}`} className="pv-chip">
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/categories" className="pv-chip font-medium">
                {browseAllCategoriesLabel} →
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </section>
  )
}
