"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LikeButton({
  productId,
  initialLiked,
  initialTotal,
}: {
  productId: string
  initialLiked: boolean
  initialTotal: number
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${productId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setTotal(data.totalLikes)
      }
    } catch {
      // silent fail
    }
    setLoading(false)
  }

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={liked ? "text-white" : ""}
    >
      <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
      {liked ? "Liked" : "Like"}
      <span className="ml-2">{total}</span>
    </Button>
  )
}
