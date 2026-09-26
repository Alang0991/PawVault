"use client"

import { useState } from "react"
import { GiftCard as GiftCardType } from "@prisma/client"
import { Check, Clock, AlertCircle, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function GiftCard({ giftCard }: { giftCard: GiftCardType }) {
  const [redeeming, setRedeeming] = useState(false)
  const [redeemed, setRedeemed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxUsesReached = giftCard.maxUses !== null && giftCard.usedCount >= giftCard.maxUses
    const expired = giftCard.endsAt ? new Date(giftCard.endsAt.getTime()) < new Date() : false
  const notYetActive = giftCard.startsAt && new Date(giftCard.startsAt) > new Date()
  const isAvailable = !expired && !maxUsesReached && !notYetActive && giftCard.isActive

  const cardValue = (): string => {
    if (giftCard.type === "percentage") {
      return `${giftCard.value}% off`
    }
    return `$${giftCard.value.toFixed(2)}`
  }

  return (
    <div className={`border rounded-lg p-5 ${isAvailable ? "bg-card" : "opacity-60 bg-card"}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">Gift Card</h3>
          <p className="text-xs text-muted-foreground font-mono">{giftCard.code}</p>
        </div>
        <div className="text-2xl font-bold">{cardValue()}</div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Tag className="h-3 w-3" />
          <span>{giftCard.type === "percentage" ? "Percentage" : "Fixed value"}</span>
          <span>·</span>
          <span>{giftCard.currency}</span>
        </div>

        {giftCard.maxUses && (
          <div className="flex items-center gap-2">
            <Check className="h-3 w-3" />
            <span>{giftCard.usedCount} / {giftCard.maxUses} uses</span>
          </div>
        )}

        {giftCard.minPurchase && (
          <div>Min purchase: ${giftCard.minPurchase.toFixed(2)}</div>
        )}

        {expired && (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-3 w-3" />
            <span>Expired</span>
          </div>
        )}
        {notYetActive && (
          <div className="flex items-center gap-2 text-yellow-500">
            <Clock className="h-3 w-3" />
            {giftCard.startsAt ? new Date(giftCard.startsAt.getTime()).toLocaleDateString() : "N/A"}
          </div>
        )}
        {maxUsesReached && (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-3 w-3" />
            <span>Usage limit reached</span>
          </div>
        )}
      </div>

      {isAvailable ? (
        <button
          className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90"
          onClick={() => {
            setRedeeming(true)
            setTimeout(() => {
              setRedeemed(true)
              setRedeeming(false)
            }, 800)
          }}
          disabled={redeeming}
        >
          {redeeming ? "Redeeming..." : redeemed ? "Redeemed" : "Redeem Now"}
        </button>
      ) : (
        <button
          className="mt-4 w-full bg-muted text-muted-foreground py-2 rounded-md text-sm font-medium cursor-not-allowed"
          disabled
        >
          {expired ? "Expired" : maxUsesReached ? "Used Up" : notYetActive ? "Not Yet Active" : "Unavailable"}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  )
}
