"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { Price } from "@/components/price"
import { Trash2, Minus, Plus, Package } from "lucide-react"

interface CartItemRowProps {
  item: {
    id: string
    quantity: number
    product: {
      id: string
      slug: string
      title: string
      price: number
      salePrice?: number | null
      isOnSale?: boolean
      isFree?: boolean
      contentRating?: "SFW" | "MATURE" | "NSFW" | string
      creator: {
        id: string
        username: string
        displayName?: string | null
        avatar?: string | null
      }
      media?: { id?: string; url: string }[]
    }
  }
}

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [quantity, setQuantity] = useState(item.quantity)

  const product = item.product
  const creatorName = product.creator.displayName || product.creator.username
  const thumbnail = product.media?.[0]

  const updateQuantity = async (next: number) => {
    if (next < 1) {
      await removeItem()
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/cart/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: next }),
      })
      if (res.ok) {
        setQuantity(next)
        router.refresh()
      }
    } finally {
      setBusy(false)
    }
  }

  const removeItem = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/cart/items/${item.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-surface-subtle">
        {thumbnail ? (
          <AdultContentPreview
            mediaId={thumbnail.id}
            directUrl={thumbnail.url}
            contentRating={product.contentRating || "SFW"}
            alt={product.title}
            variant="image"
            className="h-20 w-20"
            imgClassName="h-20 w-20 object-cover"
            showBadge={false}
          />
        ) : (
          <div className="h-20 w-20 flex items-center justify-center text-text-muted">
            <Package className="h-6 w-6 opacity-30" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/product/${product.slug}`}
              className="font-medium text-sm text-text-primary hover:text-accent line-clamp-1"
            >
              {product.title}
            </Link>
            <div className="flex items-center gap-1.5 mt-1">
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={product.creator.avatar || ""}
                  alt={creatorName}
                />
                <AvatarFallback className="text-xs">
                  {creatorName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-text-muted">{creatorName}</span>
            </div>
          </div>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={removeItem}
            aria-label="Remove from cart"
            disabled={busy}
          >
            <Trash2 className="h-4 w-4 text-text-muted hover:text-error" />
          </IconButton>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={busy}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm text-text-primary w-6 text-center">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={busy}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Price
            amount={product.price}
            salePrice={product.salePrice}
            isFree={product.isFree}
            amountClassName="text-base"
          />
        </div>
      </div>
    </div>
  )
}

CartItemRow.displayName = "CartItemRow"
