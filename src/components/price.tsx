import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PriceProps {
  amount: number
  currency?: string
  salePrice?: number | null
  isFree?: boolean
  className?: string
  amountClassName?: string
  saleClassName?: string
  compareClassName?: string
}

export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function Price({
  amount,
  currency = "USD",
  salePrice,
  isFree,
  className,
  amountClassName,
  saleClassName,
  compareClassName,
}: PriceProps) {
  if (isFree) {
    return (
      <Badge
        variant="success"
        size="sm"
        className={cn("font-semibold", className, saleClassName)}
      >
        Free
      </Badge>
    )
  }

  if (salePrice && salePrice < amount) {
    return (
      <div className={cn("flex items-baseline gap-2", className)}>
        <span
          className={cn(
            "text-price font-bold text-lg",
            amountClassName
          )}
        >
          {formatPrice(salePrice, currency)}
        </span>
        <span
          className={cn(
            "text-sm text-text-muted line-through",
            compareClassName
          )}
        >
          {formatPrice(amount, currency)}
        </span>
        <Badge
          variant="sale"
          size="sm"
          className={cn("font-semibold", saleClassName)}
        >
          -{Math.round(((amount - salePrice) / amount) * 100)}%
        </Badge>
      </div>
    )
  }

  return (
    <span
      className={cn("text-price font-bold text-lg", amountClassName, className)}
    >
      {formatPrice(amount, currency)}
    </span>
  )
}
