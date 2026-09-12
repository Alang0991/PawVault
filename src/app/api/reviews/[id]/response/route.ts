export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const responseSchema = z.object({
  response: z.string().min(1).max(1000),
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["CREATOR", "VERIFIED_CREATOR", "ADMIN", "FOUNDER"].includes(user.role)) {
      return NextResponse.json({ error: "Creator account required" }, { status: 403 })
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: { product: { select: { creatorId: true } } },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.product.creatorId !== user.id) {
      return NextResponse.json({ error: "You can only respond to reviews on your own products" }, { status: 403 })
    }

    if (review.creatorResponse) {
      return NextResponse.json({ error: "Response already exists" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = responseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid response", details: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: {
        creatorResponse: parsed.data.response,
        creatorResponseAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.REVIEW_CREATOR_RESPONSE,
      details: {
        reviewId: params.id,
        productId: review.productId,
        response: parsed.data.response,
      },
      entityType: "review",
      entityId: params.id,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Creator response error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: { product: { select: { creatorId: true } } },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.product.creatorId !== user.id) {
      return NextResponse.json({ error: "You can only delete your own responses" }, { status: 403 })
    }

    await prisma.review.update({
      where: { id: params.id },
      data: {
        creatorResponse: null,
        creatorResponseAt: null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.REVIEW_CREATOR_RESPONSE,
      details: {
        reviewId: params.id,
        productId: review.productId,
        action: "deleted_response",
      },
      entityType: "review",
      entityId: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete creator response error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}