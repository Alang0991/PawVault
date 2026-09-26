"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/ui/icon-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Price } from "@/components/price"
import { Rating } from "@/components/rating"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { Heart, Package, ShoppingCart } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { StatusBadge } from "@/components/status-badge"

interface Product {
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

interface ProductCardProps {
  product: Product
  isOwned?: boolean
  onAddToCart?: (productId: string) => void
}

export function ProductCard({ product, isOwned, onAddToCart }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(product._count?.favorites || 0)
  const { data: session } = useSession()

  const thumbnail = product.media?.[0]
  const creatorName = product.creator.displayName || product.creator.username || "Unknown"
  const hasDiscount = product.isOnSale && product.salePrice && product.salePrice < product.price

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!session) return
    fetch("/api/user/wishlist", {
      method: isLiked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    }).then((res) => {
      if (res.ok) {
        setIsLiked(!isLiked)
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
      }
    })
  }

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="flex flex-col">
        {/* Image — dominant visual area */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-subtle border border-border">
          {thumbnail ? (
            <AdultContentPreview
              mediaId={thumbnail.id}
              directUrl={thumbnail.url}
              contentRating={product.contentRating || "SFW"}
              alt={product.title}
              className="w-full h-full"
              imgClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              variant="image"
              aspect="video"
              showBadge
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <Package className="h-8 w-8 opacity-30" />
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {hasDiscount && (
              <Badge variant="sale" size="sm" className="font-bold">
                -{Math.round(((product.price - product.salePrice!) / product.price) * 100)}%
              </Badge>
            )}
            {product.isFree && <StatusBadge type="free" />}
            {isOwned && <StatusBadge type="owned" />}
            {product.contentRating !== "SFW" && <StatusBadge type="mature" />}
          </div>

          {/* Wishlist action */}
          <IconButton
            variant="ghost"
            size="sm"
            className="absolute top-2.5 right-2.5 bg-surface/70 backdrop-blur hover:bg-surface group-opacity-100 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleLike}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={
                isLiked
                  ? "h-4 w-4 fill-rose-500 text-rose-500"
                  : "h-4 w-4 text-text-secondary"
              }
            />
          </IconButton>
        </div>

        {/* Info area */}
        <div className="pt-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={product.creator.avatar || ""} alt={creatorName} />
              <AvatarFallback className="text-[10px]">
                {creatorName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-text-muted truncate">
                {creatorName}
              </span>
              {product.creator.isVerified && (
                <StatusBadge type="verified" size="sm" className="shrink-0" />
              )}
            </span>
          </div>

          <p className="text-sm font-medium text-text-primary line-clamp-1 group-hover:text-accent transition-colors">
            {product.title}
          </p>

          <div className="flex items-center justify-between">
            <Price
              amount={product.price}
              salePrice={product.salePrice}
              isFree={product.isFree}
              amountClassName="text-base"
            />
            {typeof product.rating === "number" &&
              product.rating > 0 &&
              (product.reviewCount || 0) > 0 && (
                <Rating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  size="sm"
                  showCount
                />
              )}
          </div>
          {onAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddToCart(product.id)
              }}
              className="mt-2 w-full text-xs text-primary hover:text-accent transition-colors font-medium"
            >
              <ShoppingCart className="inline h-3 w-3 mr-1" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
