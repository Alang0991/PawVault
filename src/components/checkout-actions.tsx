"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, ExternalLink } from "lucide-react"

interface CheckoutActionsProps {
  cartId: string
}

interface CheckoutOrder {
  id: string
  checkoutUrl: string
  total: number
}

interface CheckoutResult {
  multiCreator: boolean
  orders: CheckoutOrder[]
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)

export function CheckoutActions({ cartId }: CheckoutActionsProps) {
  const [coupon, setCoupon] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [multiOrders, setMultiOrders] = useState<CheckoutOrder[] | null>(null)

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
              Pay <strong>{formatCurrency(order.total)}</strong>
            </span>
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
