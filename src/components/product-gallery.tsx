"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { AdultContentPreview } from "@/components/adult-content-preview"
import Image from "next/image"
import { Package } from "lucide-react"

interface GalleryItem {
  id?: string
  url: string
  alt?: string
}

interface ProductGalleryProps {
  items: GalleryItem[]
  title: string
  contentRating?: "SFW" | "MATURE" | "NSFW" | string
  aspect?: number
}

export function ProductGallery({
  items,
  title,
  contentRating = "SFW",
  aspect = 16 / 9,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const safeItems = items?.length ? items : [{ url: "", alt: title }]
  const active = safeItems[activeIndex] || safeItems[0]

  return (
    <div className="space-y-3">
      {/* Main preview */}
      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-surface-subtle">
        {active.url ? (
          <AdultContentPreview
            directUrl={active.url}
            contentRating={contentRating}
            alt={active.alt || title}
            variant="image"
            aspect="video"
            className="aspect-video w-full"
            imgClassName="aspect-video w-full object-cover"
            showBadge
          />
        ) : (
          <div className="aspect-video w-full flex items-center justify-center text-text-muted">
            <Package className="h-10 w-10 opacity-30" />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {safeItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safeItems.map((item, idx) => {
            const isActive = idx === activeIndex
            return item.url ? (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "shrink-0 w-16 h-12 rounded border overflow-hidden",
                  isActive
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-border hover:border-accent"
                )}
              >
                <Image
                  src={item.url}
                  alt={item.alt || `${title} ${idx + 1}`}
                  width={64}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <div
                key={idx}
                className={cn(
                  "shrink-0 w-16 h-12 rounded border flex items-center justify-center bg-surface-subtle",
                  isActive && "border-accent ring-2 ring-accent/30"
                )}
              >
                <Package className="h-4 w-4 text-text-muted" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

ProductGallery.displayName = "ProductGallery"
