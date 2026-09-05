"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/helpers"
import Link from "next/link"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { Heart } from "lucide-react"

export default function WishlistPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await fetch("/api/user/wishlist")
        const data = await res.json()
        if (res.ok) {
          setItems(data.items || [])
        } else {
          setError(data.error || "Failed to load wishlist")
        }
      } catch {
        setError("Something went wrong. Please try again.")
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
        <p className="text-muted-foreground">Loading your wishlist...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Wishlist</h1>
        <Card>
          <CardContent className="p-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button asChild variant="outline">
              <Link href="/browse">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
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
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
              <Button asChild>
                <Link href="/browse">Browse Assets</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item: any) => {
              const product = item.product
              const thumbnail = product.media?.[0]
              return (
                <Card key={item.id} className="h-full">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {thumbnail ? (
                      <AdultContentPreview
                        mediaId={thumbnail.id}
                        directUrl={thumbnail.url}
                        contentRating={product.contentRating || "SFW"}
                        alt={product.title}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover"
                        variant="image"
                        aspect="video"
                        showBadge
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1">{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-lg font-bold">{formatPrice(product.price)}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
