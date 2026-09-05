"use client"

import { useState } from "react"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { cn } from "@/lib/utils"

interface MediaItem {
  id: string
  url: string
  type: string
  isThumbnail: boolean
  order: number
}

export function ProductGallery({
  media,
  contentRating,
}: {
  media: MediaItem[]
  contentRating: "SFW" | "MATURE" | "NSFW" | string
}) {
  const [active, setActive] = useState(0)
  if (media.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
        No preview available
      </div>
    )
  }
  const current = media[active] ?? media[0]
  return (
    <div className="space-y-3">
      <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative">
        <AdultContentPreview
          mediaId={current.id}
          directUrl={current.url}
          contentRating={contentRating}
          alt=""
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
          variant="image"
          aspect="square"
          priority
        />
      </div>
      {media.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {media.slice(0, 8).map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActive(i)}
              className={cn(
                "aspect-square bg-gray-200 dark:bg-gray-800 rounded overflow-hidden border-2 transition-colors",
                i === active ? "border-purple-500" : "border-transparent hover:border-muted-foreground/40",
              )}
            >
              <AdultContentPreview
                mediaId={m.id}
                directUrl={m.url}
                contentRating={contentRating}
                alt=""
                className="w-full h-full"
                imgClassName="w-full h-full object-cover"
                variant="image"
                aspect="square"
                showBadge={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
