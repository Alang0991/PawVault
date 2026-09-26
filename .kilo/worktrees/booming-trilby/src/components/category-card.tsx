import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag } from "lucide-react"

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
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const productCount = category._count?.products ?? 0
  const Icon = category.icon ? null : ShoppingBag

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group block rounded-lg border bg-surface p-5 transition-all duration-200 hover:border-accent hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
        <h3 className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors">
          {category.name}
        </h3>
        {productCount > 0 && (
          <Badge
            variant="subtle"
            size="sm"
            className="mt-1"
          >
            {productCount} asset{productCount === 1 ? "" : "s"}
          </Badge>
        )}
      </div>
    </Link>
  )
}

CategoryCard.displayName = "CategoryCard"
