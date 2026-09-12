"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, RotateCcw, AlertCircle, CheckCircle } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface OrderItem {
  id: string
  title: string
  slug: string
  price: number
  salePrice: number | null
  isFree: boolean
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  currency: string
  createdAt: string
  items: OrderItem[]
}

export function RefundRequestForm({ order }: { order: Order }) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("requested_by_customer")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [refund, setRefund] = useState<any>(null)

  const maxRefundable = order.total
  const currentRefunded = 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (parseFloat(amount) > maxRefundable) {
      setError(`Amount cannot exceed $${maxRefundable.toFixed(2)}`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${order.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), reason: details || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        setRefund(data.refund)
      } else {
        setError(data.error || "Failed to process refund")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return formatCurrency(price, order.currency?.toUpperCase() || "USD")
  }

  return (
    <Card className="border-amber-500/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <RotateCcw className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Request Refund</CardTitle>
            <CardDescription>
              Order #{order.orderNumber} • {formatPrice(order.total)} • {order.status}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {success && refund && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Refund Processed Successfully</p>
                <p className="text-sm">Refund ID: {refund.id} • Amount: {formatPrice(refund.amount)}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refund-amount">Refund Amount</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">{order.currency.toUpperCase()}</span>
                <Input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxRefundable}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={formatPrice(maxRefundable)}
                  disabled={submitting}
                  className="w-48"
                />
                <span className="text-sm text-text-muted">Max: {formatPrice(maxRefundable)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="refund-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested_by_customer">Changed mind / No longer needed</SelectItem>
                  <SelectItem value="duplicate">Accidental duplicate purchase</SelectItem>
                  <SelectItem value="fraudulent">Unauthorized / Fraudulent charge</SelectItem>
                  <SelectItem value="product_not_received">Product not received / Download failed</SelectItem>
                  <SelectItem value="product_unacceptable">Product doesn't match description</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-details">Additional Details (optional)</Label>
              <Textarea
                id="refund-details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide more details about why you're requesting a refund..."
                disabled={submitting}
              />
            </div>

            <Button type="submit" className="w-full gradient-bg text-white" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing Refund...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Submit Refund Request
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}