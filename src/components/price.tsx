import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/components/providers/currency-provider"
import { formatCurrency } from "@/lib/currency"

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

export function formatPrice(amount: number, currency?: string, locale?: string): string {
  return formatCurrency(amount, currency, locale)
}

export function Price({
  amount,
  currency,
  salePrice,
  isFree,
  className,
  amountClassName,
  saleClassName,
  compareClassName,
}: PriceProps) {
  const currencyCtx = useCurrency()

  const effectiveCurrency = currency || currencyCtx?.displayCurrency || "USD"
  const displayAmount = currency
    ? amount
    : currencyCtx ? currencyCtx.convertAmount(amount) : amount

  const displaySalePrice = salePrice && salePrice < amount
    ? (currency ? salePrice : currencyCtx ? currencyCtx.convertAmount(salePrice) : salePrice)
    : null

  const displayComparePrice = salePrice && salePrice < amount
    ? (currency ? amount : currencyCtx ? currencyCtx.convertAmount(amount) : amount)
    : null

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

  if (displaySalePrice !== null && displaySalePrice < (displayComparePrice || amount)) {
    return (
      <div className={cn("flex items-baseline gap-2", className)}>
        <span
          className={cn(
            "text-price font-bold text-lg",
            amountClassName
          )}
        >
          {formatPrice(displaySalePrice, effectiveCurrency)}
        </span>
        <span
          className={cn(
            "text-sm text-text-muted line-through",
            compareClassName
          )}
        >
          {formatPrice(displayComparePrice || amount, effectiveCurrency)}
        </span>
        <Badge
          variant="sale"
          size="sm"
          className={cn("font-semibold", saleClassName)}
        >
          -{Math.round(((amount - salePrice!) / amount) * 100)}%
        </Badge>
      </div>
    )
  }

  return (
    <span
      className={cn("text-price font-bold text-lg", amountClassName, className)}
    >
      {formatPrice(displayAmount, effectiveCurrency)}
    </span>
  )
}
