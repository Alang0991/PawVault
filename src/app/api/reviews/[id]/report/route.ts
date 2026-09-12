export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const reportSchema = z.object({
  reviewId: z.string(),
  reason: z.enum(["spam", "inappropriate", "fake", "off-topic", "harassment", "other"]),
  details: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = reportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const { reviewId, reason, details } = parsed.data

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { creatorId: true } } },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.userId === user.id) {
      return NextResponse.json({ error: "You cannot report your own review" }, { status: 400 })
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        isReported: true,
        reportCount: { increment: 1 },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.REPORT_CREATED,
      details: {
        reviewId,
        reason,
        details,
        productId: review.productId,
      },
      entityType: "review",
      entityId: reviewId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Report review error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}