"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"

interface ShareButtonProps {
  url: string
  title?: string
  compact?: boolean
}

export function ShareButton({ url, title, compact = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const shareData = {
      title: title || "Check this out on PawVault",
      url,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // User cancelled or share failed, fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
    }
  }

  return (
    <Button
      variant="ghost"
      size={compact ? "sm" : "icon"}
      onClick={handleShare}
      title="Share"
      className={compact ? "h-8 px-3 text-xs" : ""}
    >
      {copied ? (
        <Check className="h-4 w-4 mr-2 text-green-600" />
      ) : (
        <Share2 className="h-4 w-4 mr-2" />
      )}
      {copied ? "Copied!" : compact ? "Share" : <span className="sr-only">Share</span>}
    </Button>
  )
}
