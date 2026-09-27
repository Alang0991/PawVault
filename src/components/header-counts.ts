"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuthStatus } from "@/hooks/use-auth-status"

export interface HeaderCounts {
  wishlist: number
  cart: number
}

export function useHeaderCounts(): HeaderCounts {
  const { session, isAuthenticated } = useAuthStatus()
  const [counts, setCounts] = useState<HeaderCounts>({ wishlist: 0, cart: 0 })

  const userId = session?.user?.id

  const fetchCounts = useCallback(async () => {
    // Keyed on the user id alone. Gating on NextAuth's `status` meant a
    // background session refresh re-ran this with `status === "loading"`,
    // which reset the wishlist and cart badges to 0 and then refilled them.
    if (!userId || !isAuthenticated) {
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
  }, [userId, isAuthenticated])

  useEffect(() => {
    void fetchCounts()
  }, [fetchCounts])

  return counts
}
