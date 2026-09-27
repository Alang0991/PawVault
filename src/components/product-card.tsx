"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/ui/icon-button"
import { Price } from "@/components/price"
import { Rating } from "@/components/rating"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { Heart, Package } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslation } from "@/hooks/use-translation"
import { formatCount } from "@/lib/format"
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
  salesCount?: number
  category?: { name: string; slug: string } | null
  tags?: { tag: { name: string; slug: string } }[]
  _count?: {
    favorites: number
    downloads?: number
  }
}

interface ProductCardProps {
  product: Product
  isOwned?: boolean
  onAddToCart?: (productId: string) => void
}

export function ProductCard({ product, isOwned, onAddToCart }: ProductCardProps) {
  const { t } = useTranslation()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(product._count?.favorites || 0)
  const { data: session } = useSession()

  const thumbnail = product.media?.[0]
  const creatorName = product.creator.displayName || product.creator.username || "Unknown"
  const hasDiscount = product.isOnSale && product.salePrice && product.salePrice < product.price
  const salesCount = product.salesCount ?? product._count?.downloads ?? 0

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
      <div className="pv-product-card flex flex-col">
        {/* Image — the product is the star, so it owns the card */}
        <div className="pv-product-media aspect-[4/3] w-full">
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
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <Package className="h-7 w-7 opacity-30" aria-hidden="true" />
            </div>
          )}

          {/* At most two chips: one commercial signal, one content signal.
              Anything more turns a product grid into a wall of badges. */}
          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {hasDiscount ? (
              <Badge variant="sale" size="sm" className="font-bold">
                -{Math.round(((product.price - product.salePrice!) / product.price) * 100)}%
              </Badge>
            ) : product.isFree ? (
              <StatusBadge type="free" />
            ) : isOwned ? (
              <StatusBadge type="owned" />
            ) : null}
            {product.contentRating !== "SFW" && <StatusBadge type="mature" />}
          </div>

          <IconButton
            variant="ghost"
            size="sm"
            className="absolute right-2.5 top-2.5 bg-surface/80 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
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

        {/* Info — quiet, stacked, scannable in a grid */}
        <div className="mt-3 flex flex-col gap-1">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-text-primary">
            {product.title}
          </h3>

          <p className="truncate text-xs text-text-muted">
            {t("marketplace.byCreator", { name: creatorName })}
          </p>

          {(salesCount > 0 || (product.rating ?? 0) > 0) && (
            <p className="flex items-center gap-1.5 text-xs text-text-muted">
              {typeof product.rating === "number" && product.rating > 0 && (
                <Rating rating={product.rating} size="sm" showCount={false} />
              )}
              {salesCount > 0 && (
                <span>
                  {t("marketplace.salesLabel", { count: formatCount(salesCount) })}
                </span>
              )}
            </p>
          )}

          <div className="mt-1.5">
            <Price
              amount={product.price}
              salePrice={product.salePrice}
              isFree={product.isFree}
              amountClassName="text-base font-semibold"
            />
          </div>
        </div>

        {onAddToCart && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart(product.id)
            }}
            className="mt-3 w-full rounded-lg border py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-text-primary focus-ring"
          >
            {t("marketplace.addToCart")}
          </button>
        )}
      </div>
    </Link>
  )
}
