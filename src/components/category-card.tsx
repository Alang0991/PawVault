import Link from "next/link"
import { cn } from "@/lib/utils"
import { Box, Clapperboard, Shirt, Sparkles, ShoppingBag, Shapes, PackageOpen } from "lucide-react"
import type { TranslationKeys } from "@/lib/i18n/translations/en"
import { getCategoryTranslationKey } from "@/lib/i18n/category-translations"

interface CategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    description?: string | null
    icon?: string | null
    _count?: { products?: number }
    image?: string | null
  }
  className?: string
  t?: (key: string) => string
  translations?: TranslationKeys
}

export function CategoryCard({ category, className, t, translations }: CategoryCardProps) {
  const productCount = category._count?.products ?? 0
  const slug = category.slug.toLowerCase()
  const Icon = slug.includes("avatar") ? Sparkles
    : slug.includes("animation") || slug.includes("expression") ? Clapperboard
    : slug.includes("cloth") || slug.includes("accessor") ? Shirt
    : slug.includes("texture") || slug.includes("material") ? Shapes
    : slug.includes("particle") || slug.includes("vfx") ? Sparkles
    : slug.includes("resource") || slug.includes("free") ? PackageOpen
    : slug.includes("3d") || slug.includes("model") ? Box
    : ShoppingBag

  const categoryTranslationKey = getCategoryTranslationKey(slug)
  const fullCategoryKey = categoryTranslationKey ? `home.${categoryTranslationKey}` : null

  const categoryName = t
    ? fullCategoryKey
      ? t(fullCategoryKey)
      : category.name
    : translations && categoryTranslationKey
      ? translations.home[categoryTranslationKey] ?? category.name
      : category.name

  const assetLabel = t
    ? `${productCount} ${t(productCount === 1 ? "common.asset" : "common.assets")}`
    : `${productCount} asset${productCount === 1 ? "" : "s"}`

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40",
        className
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-text-secondary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-text-primary">
          {categoryName}
        </span>
        {productCount > 0 && (
          <span className="block text-xs text-text-muted">{assetLabel}</span>
        )}
      </span>
    </Link>
  )
}

CategoryCard.displayName = "CategoryCard"
