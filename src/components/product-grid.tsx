import { cn } from "@/lib/utils"
import { ProductCard } from "@/components/product-card"
import type { ReactNode } from "react"

interface ProductGridProps {
  products: any[]
  emptyMessage?: ReactNode
  className?: string
}

export function ProductGrid({
  products,
  emptyMessage = "No products yet.",
  className,
}: ProductGridProps) {
  if (!products.length) {
    return (
      <div
        className={cn(
          "text-center py-12 text-text-muted",
          className
        )}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

ProductGrid.displayName = "ProductGrid"
