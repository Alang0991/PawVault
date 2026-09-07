import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  slug: string
  _count?: { products: number }
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return <p className="text-center text-text-muted py-8">No categories found.</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/categories/${c.slug}`}
          className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent hover:bg-surface transition-colors"
        >
          <span className="font-medium text-sm text-text-primary">{c.name}</span>
          {c._count?.products !== undefined && (
            <Badge variant="secondary" size="sm">
              {c._count.products}
            </Badge>
          )}
        </Link>
      ))}
    </div>
  )
}

CategoryGrid.displayName = "CategoryGrid"