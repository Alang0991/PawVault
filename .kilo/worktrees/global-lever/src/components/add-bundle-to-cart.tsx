"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Package, Loader2 } from "lucide-react"

export function AddBundleToCart({ bundleId }: { bundleId: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addToCart = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleId, quantity: 1 }),
      })
      if (res.ok) {
        router.push("/cart")
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Could not add bundle to cart")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={addToCart}
        disabled={busy || !session}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Package className="h-4 w-4 mr-2" />
        )}
        {busy ? "Adding..." : session ? "Add bundle to cart" : "Sign in to add to cart"}
      </Button>
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      {!session && !error && (
        <p className="text-xs text-text-muted text-center">
          Sign in to purchase this bundle.
        </p>
      )}
    </div>
  )
}
