export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

function buildBlurredSvg(seed: string, label: string): string {
  // Server-rendered blurred placeholder. We embed a real gaussian-blurred
  // base image data URL (or a gradient), so the original storage URL is
  // never exposed to viewers without authorization.
  const hash = Array.from(seed).reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0)
  const hue1 = Math.abs(hash) % 360
  const hue2 = (hue1 + 60) % 360
  const initials = label
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2) || "18"

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" />
    </filter>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue1}, 65%, 35%)" />
      <stop offset="50%" stop-color="hsl(${(hue1 + 30) % 360}, 60%, 30%)" />
      <stop offset="100%" stop-color="hsl(${hue2}, 55%, 25%)" />
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.55)" />
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#g)" filter="url(#blur)" />
  <rect width="800" height="800" fill="url(#vignette)" />
  <text x="400" y="420" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="140" font-weight="700" fill="rgba(255,255,255,0.85)">${initials}</text>
  <text x="400" y="540" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="600" fill="rgba(255,255,255,0.85)" letter-spacing="6">18+ ADULT</text>
</svg>`
}

export async function GET(
  request: Request,
  { params }: { params: { mediaId: string } },
) {
  try {
    const media = await prisma.productMedia.findUnique({
      where: { id: params.mediaId },
      include: { product: { select: { id: true, title: true, contentRating: true, creatorId: true } } },
    })
    if (!media) {
      return new NextResponse("Not found", { status: 404 })
    }

    const isNsfw = media.product.contentRating === "NSFW"

    if (!isNsfw) {
      // Non-NSFW media: serve a redirect to the original storage URL.
      return NextResponse.redirect(media.url, { status: 302 })
    }

    // NSFW: check if the viewer is authorized (signed in AND adult content enabled).
    const user = await getServerUser()
    if (!user) {
      return new NextResponse(buildBlurredSvg(media.id + media.product.id, media.product.title), {
        status: 200,
        headers: {
          "content-type": "image/svg+xml; charset=utf-8",
          "cache-control": "private, no-store",
          "x-pawvault-preview": "blurred",
        },
      })
    }

    const prefs = await prisma.userPreference.findUnique({ where: { userId: user.id } })
    const allowed = !!prefs?.showAdultContent

    if (!allowed) {
      return new NextResponse(buildBlurredSvg(media.id + media.product.id, media.product.title), {
        status: 200,
        headers: {
          "content-type": "image/svg+xml; charset=utf-8",
          "cache-control": "private, no-store",
          "x-pawvault-preview": "blurred",
        },
      })
    }

    // Authorized: redirect to the original asset.
    return NextResponse.redirect(media.url, { status: 302 })
  } catch (error) {
    console.error("Preview proxy error:", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
