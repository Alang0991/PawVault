import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
        "group relative block overflow-hidden rounded-2xl border border-border/70 bg-surface/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:bg-surface hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/10 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors">
          {categoryName}
        </h3>
        {productCount > 0 && (
          <Badge
            variant="subtle"
            size="sm"
            className="mt-1"
          >
            {assetLabel}
          </Badge>
        )}
      </div>
    </Link>
  )
}

CategoryCard.displayName = "CategoryCard"
