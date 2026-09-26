"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, ExternalLink } from "lucide-react"
import { useCurrency } from "@/components/providers/currency-provider"
import { formatCurrency } from "@/lib/currency"
import { convertForDisplay } from "@/lib/currency"
import { useTranslation } from "@/hooks/use-translation"

interface CheckoutActionsProps {
  cartId: string
  paymentCurrency?: string
}

interface CheckoutOrder {
  id: string
  checkoutUrl: string
  total: number
  currency: string
}

interface CheckoutResult {
  multiCreator: boolean
  orders: CheckoutOrder[]
  freeAcquisition?: boolean
}

export function CheckoutActions({ cartId, paymentCurrency }: CheckoutActionsProps) {
  const { t } = useTranslation()
  const [coupon, setCoupon] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [multiOrders, setMultiOrders] = useState<CheckoutOrder[] | null>(null)
  const { displayCurrency, rates } = useCurrency()

  const formatOrderCurrency = (amount: number, currency: string) => {
    const { value, currency: outCurrency } = convertForDisplay(
      amount,
      currency.toUpperCase(),
      displayCurrency,
      rates,
    )
    return formatCurrency(value, outCurrency)
  }

  const startCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, couponCode: coupon || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t("checkout.checkoutError"))
        return
      }

      if (data.freeAcquisition) {
        window.location.href = "/library"
        return
      }

      if (!data.multiCreator && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      if (data.multiCreator && data.orders?.length) {
        setMultiOrders(data.orders)
      }
    } catch {
      setError(t("errors.somethingWentWrong"))
    } finally {
      setLoading(false)
    }
  }

  if (multiOrders) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-secondary">
          {t("checkout.multiCreatorMessage")}
        </p>
        {multiOrders.map((order) => (
          <Button
            key={order.id}
            className="w-full justify-between"
            size="lg"
            onClick={() => (window.location.href = order.checkoutUrl)}
          >
            <span>
              {t("checkout.pay", { amount: formatOrderCurrency(order.total, order.currency || "USD") })}
            </span>
            {paymentCurrency && order.currency !== paymentCurrency && (
              <span className="text-xs text-muted-foreground">
                ({t("checkout.paymentIn", { currency: order.currency || "USD" })})
              </span>
            )}
            <ExternalLink className="h-4 w-4" />
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder={t("checkout.couponPlaceholder")}
        value={coupon}
        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
        maxLength={20}
      />

      <Button className="w-full" size="lg" onClick={startCheckout} disabled={loading}>
        {loading ? (
          t("checkout.processing")
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            {t("checkout.completePurchase")}
          </>
        )}
      </Button>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}

CheckoutActions.displayName = "CheckoutActions"
