"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/helpers"
import Link from "next/link"

export default function WishlistPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await fetch("/api/user/wishlist")
        const data = await res.json()
        if (res.ok) {
          setItems(data.items || [])
        }
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Wishlist</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
              <Button asChild>
                <Link href="/browse">Browse Assets</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item: any) => (
              <Card key={item.id} className="h-full">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {item.product.media?.[0] ? (
                    <img src={item.product.media[0].url} alt={item.product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-clamp-1">{item.product.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-lg font-bold">{formatPrice(item.product.price)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
