"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

export interface HeaderCounts {
  wishlist: number
  cart: number
}

export function useHeaderCounts(): HeaderCounts {
  const { data: session, status } = useSession()
  const [counts, setCounts] = useState<HeaderCounts>({ wishlist: 0, cart: 0 })

  const fetchCounts = useCallback(async () => {
    if (!session?.user?.id || status !== "authenticated") {
      setCounts({ wishlist: 0, cart: 0 })
      return
    }

    try {
      const [wishlistRes, cartRes] = await Promise.all([
        fetch("/api/user/wishlist", { cache: "no-store" }),
        fetch("/api/cart", { cache: "no-store" }),
      ])

      let wishlist = 0
      let cart = 0

      if (wishlistRes.ok) {
        const wl = await wishlistRes.json()
        wishlist = wl.items?.length ?? 0
      }

      if (cartRes.ok) {
        const c = await cartRes.json()
        cart = c.cart?.items?.length ?? 0
      }

      setCounts({ wishlist, cart })
    } catch {
      setCounts({ wishlist: 0, cart: 0 })
    }
  }, [session?.user?.id, status])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  return counts
}
