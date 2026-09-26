import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CategoryCard } from "@/components/category-card"
import { SectionHeader } from "@/components/section-header"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)

  const t = (key: string) => {
    const parts = key.split(".")
    let value: any = translations
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part]
      } else {
        return key
      }
    }
    return typeof value === "string" ? value : key
  }

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      _count: { select: { products: { where: { isPublished: true } } } },
      children: {
        include: { _count: { select: { products: { where: { isPublished: true } } } } },
        take: 6,
      },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <SectionHeader
          title={t("home.categories") || "Shop by Category"}
          subtitle={t("home.handPicked") || "Find exactly what you need"}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} t={t} />
          ))}
        </div>

        {categories.length === 0 && (
          <p className="text-center text-text-muted py-12">
            {t("marketplace.noCategoriesFound") || "No categories yet. Check back soon."}
          </p>
        )}
      </div>
    </div>
  )
}