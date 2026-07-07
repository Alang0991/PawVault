"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Zap } from "lucide-react"

export function ProductActions({
  productId,
  isFree,
}: {
  productId: string
  isFree: boolean
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const [busy, setBusy] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const addToCart = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    setBusy(true)
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      router.push("/cart")
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
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      router.push("/checkout")
    } finally {
      setBusy(false)
    }
  }

  const toggleWishlist = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    setWishlisted((prev) => !prev)
    await fetch("/api/user/wishlist", {
      method: wishlisted ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })
  }

  return (
    <div className="flex gap-2">
      <Button size="lg" className="flex-1 gradient-bg text-white" onClick={addToCart} disabled={busy}>
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to {isFree ? "Collection" : "Import Queue"}
      </Button>
      <Button size="lg" variant="outline" onClick={buyNow} disabled={busy}>
        <Zap className="mr-2 h-5 w-5" />
        Buy Now
      </Button>
      <Button size="lg" variant="outline" onClick={toggleWishlist} aria-label="Add to wishlist">
        <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
      </Button>
    </div>
  )
}
