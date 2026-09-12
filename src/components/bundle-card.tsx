import { ProductGrid } from "./product-grid"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import Link from "next/link"
import { Package, TrendingDown } from "lucide-react"

interface BundleCardProps {
  bundle: any
}

export function BundleCard({ bundle }: BundleCardProps) {
  const firstProduct = bundle.items?.[0]?.product
  const thumbnail = firstProduct?.media?.[0]
  const creatorName =
    bundle.creator?.displayName || bundle.creator?.username || "Creator"

  return (
    <Card className="overflow-hidden flex flex-col h-full group">
      <Link href={`/bundles/${bundle.slug}`} className="block">
        <div className="aspect-video w-full overflow-hidden bg-surface-subtle relative">
          {thumbnail ? (
            <img
              src={thumbnail.url}
              alt={bundle.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <Package className="h-10 w-10 opacity-40" />
            </div>
          )}
          {bundle.savings > 0 && (
            <Badge
              variant="success"
              className="absolute top-2 left-2"
              size="sm"
            >
              Save {bundle.savingsPercent}%
            </Badge>
          )}
        </div>
      </Link>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-text-primary line-clamp-1">
            <Link
              href={`/bundles/${bundle.slug}`}
              className="hover:text-accent transition-colors"
            >
              {bundle.name}
            </Link>
          </h3>
        </div>
        <p className="text-xs text-text-muted">
          by{" "}
          <Link
            href={`/creators/${bundle.creator?.username}`}
            className="hover:text-accent transition-colors"
          >
            {creatorName}
          </Link>
        </p>
      </CardHeader>

      <CardContent className="pt-0 flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">
            {bundle.itemCount || bundle.items?.length || 0} products
          </span>
          {bundle.savings > 0 && (
            <span className="text-emerald-600 text-xs flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Save ${(bundle.savings).toFixed(2)}
            </span>
          )}
        </div>
        {bundle.description && (
          <p className="text-xs text-text-secondary mt-2 line-clamp-2">
            {bundle.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-text-primary">
            ${(bundle.price).toFixed(2)}
          </span>
          {bundle.totalValue > bundle.price && (
            <span className="text-xs text-text-muted line-through">
              ${(bundle.totalValue).toFixed(2)} value
            </span>
          )}
        </div>
        <Button size="sm" asChild>
          <Link href={`/bundles/${bundle.slug}`}>View bundle</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
