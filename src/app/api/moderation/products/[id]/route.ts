export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"
import { createAuditLog } from "@/lib/audit-logger"

const actionSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes", "suspend", "remove", "restore"]),
  reason: z.string().max(1000).optional(),
  creatorReason: z.string().max(1000).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.PRODUCTS_MANAGE)

    const body = await request.json().catch(() => null)
    const parsed = actionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { creator: { select: { id: true, username: true } } },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { action, reason, creatorReason } = parsed.data

    // Prevent self-approval where policy requires independent review
    if (action === "approve" && product.creatorId === ctx.id) {
      return NextResponse.json(
        { error: "You cannot approve your own product. Policy requires independent review." },
        { status: 403 }
      )
    }

    const validTransitions: Record<string, string[]> = {
      approve: ["PENDING_REVIEW", "REJECTED", "CHANGES_REQUESTED"],
      reject: ["PENDING_REVIEW", "CHANGES_REQUESTED"],
      request_changes: ["PENDING_REVIEW", "APPROVED"],
      suspend: ["PUBLISHED", "APPROVED", "PENDING_REVIEW"],
      remove: ["PUBLISHED", "APPROVED", "PENDING_REVIEW", "SUSPENDED", "REJECTED"],
      restore: ["SUSPENDED", "REMOVED", "REJECTED"],
    }

    const currentStatus = product.status
    if (!validTransitions[action].includes(currentStatus)) {
      return NextResponse.json(
        { error: `Cannot ${action} product in state ${currentStatus}` },
        { status: 409 }
      )
    }

    const statusMap: Record<string, string> = {
      approve: "PUBLISHED",
      reject: "REJECTED",
      request_changes: "CHANGES_REQUESTED",
      suspend: "SUSPENDED",
      remove: "REMOVED",
      restore: "PUBLISHED",
    }

    const newStatus = statusMap[action]
    const isPublished = action === "approve" || action === "restore"

    // Record moderation action
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: params.id },
        data: {
          status: newStatus as any,
          isPublished,
        },
      })

      await tx.productModeration.create({
        data: {
          productId: params.id,
          actorId: ctx.id,
          action: action.toUpperCase(),
          reason: reason || null,
          notes: creatorReason || null,
        },
      })
    })

    // Audit log
    await logAdminAction(
      ctx.id,
      action === "approve" ? AuditActions.PRODUCT_PUBLISHED : AuditActions.ADMIN_MODERATION_ACTION,
      {
        productId: params.id,
        productTitle: product.title,
        action,
        reason,
        creatorReason,
        previousStatus: currentStatus,
        newStatus,
        creatorId: product.creatorId,
      },
      { entityType: "Product", entityId: params.id },
    )

    await createAuditLog({
      userId: ctx.id,
      action: `MODERATION_${action.toUpperCase()}`,
      details: {
        productId: params.id,
        productTitle: product.title,
        creatorId: product.creatorId,
        previousStatus: currentStatus,
        newStatus,
        reason,
      },
    })

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: product.creatorId,
        type: "MODERATION",
        title: `Product ${action === "approve" ? "Approved" : action === "reject" ? "Rejected" : action === "request_changes" ? "Changes Requested" : action}`,
        content: creatorReason || reason || `Your product "${product.title}" has been ${action}d.`,
        isRead: false,
      },
    })

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    if (error instanceof Error && (error as any).status) {
      return NextResponse.json({ error: error.message }, { status: (error as any).status })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Moderation product action error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.PRODUCTS_VIEW)

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        creator: { select: { id: true, username: true, displayName: true } },
        category: true,
        media: { orderBy: { order: "asc" } },
        files: { select: { id: true, filename: true, size: true, platform: true, version: true, folder: true } },
        tags: { include: { tag: true } },
        _count: { select: { reviews: true, favorites: true, orderItems: true } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Fetch moderation history — ProductModeration has no relation to User, so query actors separately
    const moderationRecords = await prisma.productModeration.findMany({
      where: { productId: params.id },
      orderBy: { createdAt: "desc" },
    })

    const actorIds = moderationRecords.map((m) => m.actorId).filter(Boolean)
    const actors = await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, username: true, displayName: true },
    })
    const actorMap = new Map(actors.map((a) => [a.id, a]))

    const moderationHistory = moderationRecords.map((m) => ({
      ...m,
      actor: actorMap.get(m.actorId) || { username: "Unknown", displayName: null },
    }))

    return NextResponse.json({ product, moderationHistory })
  } catch (error) {
    if (error instanceof Error && (error as any).status) {
      return NextResponse.json({ error: error.message }, { status: (error as any).status })
    }
    console.error("Get moderation product error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}