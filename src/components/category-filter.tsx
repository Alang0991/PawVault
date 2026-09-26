"use client"

import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Category } from "@prisma/client"
import { useTranslation } from "@/hooks/use-translation"

interface CategoryWithCount extends Category {
  _count: {
    products: number
  }
}

export function CategoryFilter({
  storeId,
  currentCategory,
  categories,
}: {
  storeId: string
  currentCategory?: string
  categories: CategoryWithCount[]
}) {
  const router = useRouter()
  const { t } = useTranslation()

  const onChange = (value: string) => {
    const url = new URL(window.location.href)
    if (value) {
      url.searchParams.set("category", value)
    } else {
      url.searchParams.delete("category")
    }
    url.searchParams.delete("page")
    router.push(url.pathname + url.search)
  }

  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm">{t("marketplace.category")}</Label>
      <select
        value={currentCategory || ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">{t("marketplace.allCategories")}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name} ({c._count.products})
          </option>
        ))}
      </select>
    </div>
  )
}
