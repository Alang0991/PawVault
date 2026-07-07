"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatPrice } from "@/lib/helpers"
import { Star, Heart } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"

interface ProductCardProps {
  product: {
    id: string
    slug: string
    title: string
    price: number
    salePrice?: number | null
    isOnSale?: boolean
    isFree?: boolean
    media?: { url: string }[]
    creator: {
      id: string
      username?: string
      displayName?: string | null
      avatar?: string | null
    }
    rating?: number
    reviewCount?: number
    category?: { name: string; slug: string } | null
    tags?: { tag: { name: string; slug: string } }[]
    _count?: {
      favorites: number
    }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(product._count?.favorites || 0)
  const { data: session } = useSession()

  const thumbnail = product.media?.[0]
  const creatorName = product.creator.displayName || product.creator.username || "Unknown"

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      return
    }

    try {
      const res = await fetch('/api/user/wishlist', {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })

      if (res.ok) {
        setIsLiked(!isLiked)
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    }
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="h-full group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
        <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
          {thumbnail ? (
            <img src={thumbnail.url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <span className="text-4xl">📦</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.isOnSale && product.salePrice && (
              <Badge className="bg-red-500 text-white border-0 shadow-lg">Sale</Badge>
            )}
            {product.isFree && (
              <Badge className="bg-green-500 text-white border-0 shadow-lg">Free</Badge>
            )}
          </div>
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-white dark:hover:bg-black transition-colors"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'
              }`}
            />
          </button>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-base line-clamp-1 group-hover:text-rose-600 transition-colors">
            {product.title}
          </CardTitle>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={product.creator.avatar || ""} alt={creatorName} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-rose-600 to-orange-500 text-white">
                  {creatorName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground truncate">{creatorName}</p>
              {product.category && (
                <span className="ml-auto text-xs text-muted-foreground truncate max-w-[40%]">
                  {product.category.name}
                </span>
              )}
            </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-2">
            {typeof product.rating === "number" && product.rating > 0 && (
              <div className="flex items-center text-sky-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm ml-1 font-medium">{product.rating.toFixed(1)}</span>
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount || 0} reviews)
            </span>
          </div>
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.slice(0, 3).map((t) => (
                <span
                  key={t.tag.slug}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {t.tag.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex items-baseline gap-2">
            {product.isOnSale && product.salePrice ? (
              <>
                <span className="text-lg font-bold text-green-600">{formatPrice(product.salePrice)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {likesCount} likes
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
