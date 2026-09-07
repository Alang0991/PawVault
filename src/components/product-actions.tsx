"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { ShoppingCart, Heart, Zap } from "lucide-react"

export function ProductActions({
  productId,
  isFree,
  initialWishlisted = false,
  currency = "USD",
}: {
  productId: string
  isFree: boolean
  initialWishlisted?: boolean
  currency?: string
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const [busy, setBusy] = useState(false)
  const [wishlisted, setWishlisted] = useState(initialWishlisted)

  const addToCart = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    setBusy(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      if (res.ok) {
        router.push("/cart")
      }
    } finally {
      setBusy(false)
    }
  }

  const buyNow = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    setBusy(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      if (res.ok) {
        router.push("/checkout")
      }
    } finally {
      setBusy(false)
    }
  }

  const toggleWishlist = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    const next = !wishlisted
    setWishlisted(next)
    try {
      const res = await fetch("/api/user/wishlist", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok) {
        setWishlisted((prev) => !prev)
      }
    } catch {
      setWishlisted((prev) => !prev)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="lg"
        className="flex-1"
        onClick={addToCart}
        disabled={busy}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isFree ? "Add to Collection" : "Add to Cart"}
      </Button>

      {!isFree && (
        <Button
          size="lg"
          variant="outline"
          onClick={buyNow}
          disabled={busy}
        >
          <Zap className="mr-2 h-5 w-5" />
          Buy Now
        </Button>
      )}

      <IconButton
        variant={wishlisted ? "primary" : "ghost"}
        size="lg"
        onClick={toggleWishlist}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`h-5 w-5 ${
            wishlisted
              ? "fill-white text-white"
              : "text-text-secondary"
          }`}
        />
      </IconButton>
    </div>
  )
}
