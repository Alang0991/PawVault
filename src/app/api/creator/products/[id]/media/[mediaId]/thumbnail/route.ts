export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { requireCreatorAccess } from "@/lib/creator-access"

export async function POST(
  request: Request,
  { params }: { params: { id: string; mediaId: string } },
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
    }

    const forbidden = await requireCreatorAccess(user.id, user.role)
    if (forbidden) return forbidden

    const media = await prisma.productMedia.findUnique({
      where: { id: params.mediaId },
      include: { product: true },
    })
    if (!media) {
      return NextResponse.json({ error: "Media not found." }, { status: 404 })
    }
    if (media.product.id !== params.id) {
      return NextResponse.json({ error: "Media does not belong to this product." }, { status: 400 })
    }
    if (media.product.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to edit this product." }, { status: 403 })
    }

    await prisma.$transaction([
      prisma.productMedia.updateMany({
        where: { productId: params.id },
        data: { isThumbnail: false },
      }),
      prisma.productMedia.update({
        where: { id: params.mediaId },
        data: { isThumbnail: true },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Set thumbnail error:", error)
    return NextResponse.json(
      { error: "We couldn't update the thumbnail. Please try again." },
      { status: 500 },
    )
  }
}
