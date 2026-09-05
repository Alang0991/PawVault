"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatPrice } from "@/lib/helpers"
import { Star, Heart, ShoppingCart } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: {
    id: string
    slug: string
    title: string
    price: number
    salePrice?: number | null
    isOnSale?: boolean
    isFree?: boolean
    contentRating?: "SFW" | "MATURE" | "NSFW" | string
    media?: { id?: string; url: string }[]
    creator: {
      id: string
      username?: string
      displayName?: string | null
      avatar?: string | null
      isVerified?: boolean
    }
    rating?: number
    reviewCount?: number
    category?: { name: string; slug: string } | null
    tags?: { tag: { name: string; slug: string } }[]
    _count?: {
      favorites: number
    }
  }
  isOwned?: boolean
}

export function ProductCard({ product, isOwned }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(product._count?.favorites || 0)
  const { data: session } = useSession()

  const thumbnail = product.media?.[0]
  const creatorName = product.creator.displayName || product.creator.username || "Unknown"
  const hasDiscount = product.isOnSale && product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) return

    try {
      const res = await fetch('/api/user/wishlist', {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })

      if (res.ok) {
        setIsLiked(!isLiked)
        setLikesCount((prev) => (!isLiked ? prev + 1 : prev - 1))
      }
    } catch (error) {
      // silent
    }
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="h-full group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1 flex flex-col">
        <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
          {thumbnail ? (
            <AdultContentPreview
              mediaId={thumbnail.id}
              directUrl={thumbnail.url}
              contentRating={product.contentRating || "SFW"}
              alt={product.title}
              className="w-full h-full"
              imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              variant="image"
              aspect="video"
              showBadge
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
              <ShoppingCart className="h-10 w-10 opacity-30" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.isOnSale && product.salePrice && (
              <Badge className="bg-rose-600 text-white border-0 shadow-lg text-xs">-{discountPercent}%</Badge>
            )}
            {product.isFree && (
              <Badge className="bg-emerald-600 text-white border-0 shadow-lg text-xs">Free</Badge>
            )}
            {isOwned && (
              <Badge className="bg-sky-600 text-white border-0 shadow-lg text-xs">Owned</Badge>
            )}
          </div>
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-sm hover:bg-white dark:hover:bg-black transition-colors"
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isLiked ? 'fill-rose-500 text-rose-500' : 'text-gray-600 dark:text-gray-300'
              }`}
            />
          </button>
        </div>

        <CardHeader className="pb-2 flex-1">
          <div className="flex items-start gap-2.5">
              <Avatar className="h-8 w-8 mt-0.5">
                <AvatarImage src={product.creator.avatar || ""} alt={creatorName} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-semibold">
                  {creatorName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {product.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-muted-foreground truncate">{creatorName}</span>
                  {product.creator.isVerified && (
                    <Badge className="h-3.5 w-3.5 p-0 rounded-full bg-sky-500 text-white border-0 flex items-center justify-center">
                      <svg className="h-2 w-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          {product.category && (
            <span className="text-[11px] text-muted-foreground mt-1.5 inline-block">
              {product.category.name}
            </span>
          )}
        </CardHeader>

        <CardContent className="pb-2 pt-0">
          <div className="flex items-center gap-2">
            {typeof product.rating === "number" && product.rating > 0 && (
              <div className="flex items-center text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs ml-1 font-medium">{product.rating.toFixed(1)}</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {product.reviewCount || 0}
            </span>
          </div>
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
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

        <CardFooter className="pt-2">
          <div className="flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-foreground">{formatPrice(product.salePrice!)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-lg font-bold">{product.isFree ? "Free" : formatPrice(product.price)}</span>
            )}
            <span className="text-[11px] text-muted-foreground ml-auto">
              {likesCount}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
