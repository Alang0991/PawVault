"use client"

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

  // An explicit `currency` prop marks the amount as already being in that
  // (transaction) currency — never convert it, preserving creator pricing.
  // When no currency is given the amount is in the platform base currency and
  // is converted to the user's display preference for display only.
  const displayCurrency = currency
    ? currency.toUpperCase()
    : currencyCtx.displayCurrency

  const displayAmount = currency ? amount : currencyCtx.convertAmount(amount)

  const displaySalePrice =
    salePrice && salePrice < amount
      ? currency
        ? salePrice
        : currencyCtx.convertAmount(salePrice)
      : null

  const displayComparePrice =
    salePrice && salePrice < amount
      ? currency
        ? amount
        : currencyCtx.convertAmount(amount)
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
          {formatPrice(displaySalePrice, displayCurrency)}
        </span>
        <span
          className={cn(
            "text-sm text-text-muted line-through",
            compareClassName
          )}
        >
          {formatPrice(displayComparePrice || amount, displayCurrency)}
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
      {formatPrice(displayAmount, displayCurrency)}
    </span>
  )
}
