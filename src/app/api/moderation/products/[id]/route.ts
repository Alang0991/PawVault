export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS, roleHasPermission } from "@/lib/permissions"

function getModerationAuditAction(action: string): string {
  switch (action) {
    case "approve":
      return AuditActions.PRODUCT_PUBLISHED
    case "suspend":
      return AuditActions.PRODUCT_SUSPENDED
    case "restore":
      return AuditActions.PRODUCT_RESTORED
    case "remove":
      return AuditActions.PRODUCT_REMOVED
    case "escalate":
      return AuditActions.ADMIN_MODERATION_ACTION
    case "reject":
    case "request_changes":
      return AuditActions.ADMIN_MODERATION_ACTION
    default:
      return AuditActions.ADMIN_MODERATION_ACTION
  }
}

const actionSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes", "suspend", "remove", "restore", "escalate"]),
  reason: z.string().max(1000).optional(),
  creatorReason: z.string().max(1000).optional(),
  evidence: z.string().max(2000).optional(),
})

function requireReason(action: string, reason: string | undefined): string | null {
  if ((action === "suspend" || action === "remove") && (!reason || reason.trim().length === 0)) {
    return `A reason is required to ${action} a product.`
  }
  return null
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isModerator = ["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)
    const hasManagePermission = roleHasPermission(user.role, PERMISSIONS.PRODUCTS_MANAGE, (user as any).customPermissions)
    if (!isModerator && !hasManagePermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

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

    const { action, reason, creatorReason, evidence } = parsed.data

    // Prevent self-approval where policy requires independent review
    if (action === "approve" && product.creatorId === user.id) {
      return NextResponse.json(
        { error: "You cannot approve your own product. Policy requires independent review." },
        { status: 403 }
      )
    }

    // Require reason for suspend/remove
    const reasonError = requireReason(action, reason)
    if (reasonError) {
      return NextResponse.json({ error: reasonError }, { status: 400 })
    }

    // Prevent self-approval where policy requires independent review
    if (action === "approve" && product.creatorId === user.id) {
      return NextResponse.json(
        { error: "You cannot approve your own product. Policy requires independent review." },
        { status: 403 }
      )
    }

    const validTransitions: Record<string, string[]> = {
      approve: ["PENDING_REVIEW", "REJECTED", "CHANGES_REQUESTED"],
      reject: ["PENDING_REVIEW", "CHANGES_REQUESTED"],
      request_changes: ["PENDING_REVIEW", "PUBLISHED"],
      suspend: ["PUBLISHED", "PENDING_REVIEW"],
      remove: ["PUBLISHED", "PENDING_REVIEW", "SUSPENDED", "REJECTED"],
      restore: ["SUSPENDED", "REMOVED", "REJECTED"],
      escalate: ["PENDING_REVIEW", "APPROVED", "PUBLISHED", "CHANGES_REQUESTED", "REJECTED"],
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
      escalate: "PENDING_REVIEW",
    }

    const newStatus = statusMap[action]
    const isPublished = action === "approve" || action === "restore"

    // Update product status
    await prisma.product.update({
      where: { id: params.id },
      data: { status: newStatus as any, isPublished },
    })

    // Record moderation action with full state transition
    await prisma.productModeration.create({
      data: {
        productId: params.id,
        actorId: user.id,
        action: `${action.toUpperCase()}:${currentStatus}→${newStatus}`,
        reason: reason || null,
        notes: creatorReason || null,
      },
    })

    // Audit log with specific actions per moderation type
    const moderationAuditAction = getModerationAuditAction(action)
    await logAdminAction(
      user.id,
      moderationAuditAction,
      {
        productId: params.id,
        productTitle: product.title,
        action,
        reason,
        creatorReason,
        evidence,
        previousStatus: currentStatus,
        newStatus,
        actorRole: user.role,
        actorId: user.id,
        creatorId: product.creatorId,
      },
      { entityType: "Product", entityId: params.id },
    )

    // Notify creator
    const actionLabels: Record<string, string> = {
      approve: "Approved",
      reject: "Rejected",
      request_changes: "Changes Requested",
      suspend: "Suspended",
      remove: "Removed",
      restore: "Restored",
      escalate: "Escalated for review",
    }
    await prisma.notification.create({
      data: {
        userId: product.creatorId,
        type: "MODERATION",
        title: `Product ${actionLabels[action] || action}`,
        content: creatorReason || reason || evidence || `Your product "${product.title}" has been ${actionLabels[action] || action.toLowerCase()}.`,
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
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isModerator = ["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)
    const hasViewPermission = roleHasPermission(user.role, PERMISSIONS.PRODUCTS_VIEW, (user as any).customPermissions)
    if (!isModerator && !hasViewPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

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