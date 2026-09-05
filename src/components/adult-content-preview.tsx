"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, Loader2, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AdultContentPreviewProps {
  mediaId?: string
  directUrl?: string
  contentRating: "SFW" | "MATURE" | "NSFW" | string
  alt?: string
  className?: string
  imgClassName?: string
  /** When true, show the badge + reveal CTA inline. When false, just blur the image. */
  showBadge?: boolean
  fallbackLabel?: string
  /** Render mode: 'image' uses <img>, 'background' sets background-image on a div. */
  variant?: "image" | "background"
  /** Used for background variant aspect ratio */
  aspect?: "square" | "video" | "auto"
  priority?: boolean
  sizes?: string
}

interface PrefState {
  showAdultContent: boolean
  blurNsfwPreviews: boolean
  signedIn: boolean
}

async function fetchPrefs(): Promise<PrefState> {
  try {
    const r = await fetch("/api/account/preferences", { cache: "no-store" })
    if (!r.ok) {
      return { showAdultContent: false, blurNsfwPreviews: true, signedIn: false }
    }
    const data = await r.json()
    return data.preferences
  } catch {
    return { showAdultContent: false, blurNsfwPreviews: true, signedIn: false }
  }
}

export function clearAdultContentPrefCache() {
  // No-op: preferences are fetched per-request to avoid cross-user cache leakage.
}

export function AdultContentPreview({
  mediaId,
  directUrl,
  contentRating,
  alt = "",
  className,
  imgClassName,
  showBadge = true,
  fallbackLabel,
  variant = "image",
  aspect = "square",
  priority = false,
  sizes,
}: AdultContentPreviewProps) {
  const [prefs, setPrefs] = useState<PrefState | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [imgError, setImgError] = useState(false)

  const isNsfw = contentRating === "NSFW"

  useEffect(() => {
    if (!isNsfw) {
      setPrefs({ showAdultContent: true, blurNsfwPreviews: false, signedIn: true })
      return
    }
    let alive = true
    fetchPrefs().then((p) => {
      if (alive) setPrefs(p)
    })
    return () => {
      alive = false
    }
  }, [isNsfw])

  if (!isNsfw) {
    const src = directUrl || (mediaId ? `/api/preview/${mediaId}` : "")
    if (!src || imgError) {
      return <Placeholder className={className} aspect={aspect} label={fallbackLabel} />
    }
    if (variant === "background") {
      return (
        <div
          className={cn(aspectClass(aspect), "bg-cover bg-center", className)}
          style={{ backgroundImage: `url(${src})` }}
          role="img"
          aria-label={alt}
        />
      )
    }
    return <img src={src} alt={alt} className={cn(imgClassName, className)} loading={priority ? "eager" : "lazy"} sizes={sizes} onError={() => setImgError(true)} />
  }

  // NSFW
  if (prefs === null) {
    return <Placeholder className={className} aspect={aspect} label="Loading..." busy />
  }

  const shouldBlur = !revealed && prefs.blurNsfwPreviews && !prefs.showAdultContent
  const canReveal = prefs.signedIn && prefs.showAdultContent

  if (!shouldBlur) {
    const src = mediaId ? `/api/preview/${mediaId}` : directUrl || ""
    if (!src || imgError) {
      return <Placeholder className={className} aspect={aspect} label={fallbackLabel} />
    }
    if (variant === "background") {
      return (
        <div
          className={cn(aspectClass(aspect), "bg-cover bg-center relative", className)}
          style={{ backgroundImage: `url(${src})` }}
          role="img"
          aria-label={alt}
        >
          {showBadge && <AdultBadge className="absolute top-2 left-2" />}
        </div>
      )
    }
    return (
      <div className={cn("relative", className)}>
        <img src={src} alt={alt} className={cn(imgClassName)} loading={priority ? "eager" : "lazy"} sizes={sizes} onError={() => setImgError(true)} />
        {showBadge && <AdultBadge className="absolute top-2 left-2" />}
      </div>
    )
  }

  // Blurred state
  const blurredSrc = mediaId ? `/api/preview/${mediaId}` : directUrl || ""
  if (!blurredSrc || imgError) {
    return <Placeholder className={className} aspect={aspect} label={fallbackLabel} />
  }
  if (variant === "background") {
    return (
      <div
        className={cn(aspectClass(aspect), "bg-cover bg-center relative overflow-hidden", className)}
        style={{ backgroundImage: `url(${blurredSrc})`, filter: "blur(28px)", transform: "scale(1.15)" }}
        role="img"
        aria-label={alt}
      >
        <AdultOverlay
          canReveal={canReveal}
          onReveal={() => setRevealed(true)}
          onEnable={async () => {
            setToggling(true)
            try {
              const r = await fetch("/api/account/preferences/update", {
                method: "PATCH",
                headers: { "content-Type": "application/json" },
                body: JSON.stringify({ showAdultContent: true, confirm: true }),
              })
              if (r.ok) {
                clearAdultContentPrefCache()
                setPrefs(await fetchPrefs())
              }
            } finally {
              setToggling(false)
            }
          }}
          busy={toggling}
          signedIn={prefs.signedIn}
        />
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={blurredSrc}
        alt=""
        aria-hidden="true"
        className={cn("w-full h-full object-cover", imgClassName)}
        style={{ filter: "blur(28px)", transform: "scale(1.15)" }}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        onError={() => setImgError(true)}
      />
      <AdultOverlay
        canReveal={canReveal}
        onReveal={() => setRevealed(true)}
        onEnable={async () => {
          setToggling(true)
          try {
            const r = await fetch("/api/account/preferences/update", {
              method: "PATCH",
              headers: { "content-Type": "application/json" },
              body: JSON.stringify({ showAdultContent: true, confirm: true }),
            })
            if (r.ok) {
              clearAdultContentPrefCache()
              setPrefs(await fetchPrefs())
            }
          } finally {
            setToggling(false)
          }
        }}
        busy={toggling}
        signedIn={prefs.signedIn}
      />
    </div>
  )
}

function Placeholder({ className, aspect, label, busy }: { className?: string; aspect: "square" | "video" | "auto"; label?: string; busy?: boolean }) {
  return (
    <div className={cn(aspectClass(aspect), "bg-muted flex items-center justify-center text-muted-foreground", className)}>
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="text-xs">{label || "No preview"}</span>}
    </div>
  )
}

function aspectClass(a: "square" | "video" | "auto") {
  if (a === "square") return "aspect-square"
  if (a === "video") return "aspect-video"
  return ""
}

function AdultBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-600/90 text-white shadow", className)}>
      <Lock className="h-3 w-3" /> 18+ ADULT
    </span>
  )
}

function AdultOverlay({
  canReveal,
  onReveal,
  onEnable,
  busy,
  signedIn,
}: {
  canReveal: boolean
  onReveal: () => void
  onEnable: () => void
  busy: boolean
  signedIn: boolean
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 bg-gradient-to-b from-black/30 via-black/40 to-black/70">
      <AdultBadge className="mb-2" />
      <p className="text-white text-sm font-semibold drop-shadow">Adult content</p>
      <p className="text-white/80 text-xs max-w-[260px] mt-1">
        This preview contains adult content.
      </p>
      {canReveal ? (
        <Button size="sm" variant="secondary" onClick={onReveal} className="mt-3">
          <Eye className="h-4 w-4 mr-1" /> Show preview
        </Button>
      ) : signedIn ? (
        <Button size="sm" variant="secondary" onClick={onEnable} disabled={busy} className="mt-3">
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Eye className="h-4 w-4 mr-1" />}
          Enable adult content
        </Button>
      ) : (
        <Button size="sm" variant="secondary" asChild className="mt-3">
          <Link href="/auth/signin">
            <Eye className="h-4 w-4 mr-1" /> Sign in to view
          </Link>
        </Button>
      )}
    </div>
  )
}
