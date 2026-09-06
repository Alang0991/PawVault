export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireAdminOrFounder()

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: { product: { select: { title: true } } },
    })
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    await prisma.review.delete({ where: { id: params.id } })

    await logAdminAction(
      ctx.id,
      AuditActions.REPORT_RESOLVED,
      { reviewId: params.id, productTitle: review.product.title, reviewerId: review.userId },
      { entityType: "Review", entityId: params.id },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete review error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  return DELETE(request, { params })
}
