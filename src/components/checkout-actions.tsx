"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, ExternalLink } from "lucide-react"
import { useCurrency } from "@/components/providers/currency-provider"
import { formatCurrency } from "@/lib/currency"

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
  const [coupon, setCoupon] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [multiOrders, setMultiOrders] = useState<CheckoutOrder[] | null>(null)
  const { currency: displayCurrencyCtx } = useCurrency()

  const formatOrderCurrency = (amount: number, currency: string) =>
    formatCurrency(amount, currency)

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
        setError(data.error || "Could not start checkout. Please try again.")
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
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (multiOrders) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-secondary">
          Your cart contains items from multiple creators. Complete each
          checkout below.
        </p>
        {multiOrders.map((order) => (
          <Button
            key={order.id}
            className="w-full justify-between"
            size="lg"
            onClick={() => (window.location.href = order.checkoutUrl)}
          >
            <span>
              Pay <strong>{formatOrderCurrency(order.total, order.currency || "USD")}</strong>
            </span>
            {paymentCurrency && order.currency !== paymentCurrency && (
              <span className="text-xs text-muted-foreground">
                (actual payment in {order.currency || "USD"})
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
        placeholder="Coupon code (optional)"
        value={coupon}
        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
        maxLength={20}
      />

      <Button className="w-full" size="lg" onClick={startCheckout} disabled={loading}>
        {loading ? (
          "Processing..."
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Complete Purchase
          </>
        )}
      </Button>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}

CheckoutActions.displayName = "CheckoutActions"
