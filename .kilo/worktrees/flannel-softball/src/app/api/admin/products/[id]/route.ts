export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const patchSchema = z.object({
  action: z.enum(["publish", "unpublish", "hide", "suspend", "archive", "feature", "unfeature", "delete"]),
  reason: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.PRODUCTS_MANAGE)

    const body = await request.json().catch(() => null)
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { creator: { select: { username: true, email: true } } },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { action, reason } = parsed.data

    switch (action) {
      case "publish":
        await prisma.$transaction(async (tx) => {
          await tx.product.update({
            where: { id: params.id },
            data: { isPublished: true, status: "PUBLISHED" },
          })
          await tx.productModeration.create({
            data: {
              productId: params.id,
              actorId: ctx.id,
              action: "APPROVE",
              reason: reason || null,
            },
          })
        })
        await logAdminAction(
          ctx.id,
          AuditActions.PRODUCT_PUBLISHED,
          { productId: params.id, productTitle: product.title, reason },
          { entityType: "Product", entityId: params.id },
        )
        await prisma.notification.create({
          data: {
            userId: product.creatorId,
            type: "MODERATION",
            title: "Product Approved",
            content: `Your product "${product.title}" has been approved and is now live.`,
            isRead: false,
          },
        })
        break
      case "unpublish":
        await prisma.$transaction(async (tx) => {
          await tx.product.update({
            where: { id: params.id },
            data: { isPublished: false, status: "DRAFT" },
          })
          await tx.productModeration.create({
            data: {
              productId: params.id,
              actorId: ctx.id,
              action: "REJECT",
              reason: reason || null,
            },
          })
        })
        await logAdminAction(
          ctx.id,
          AuditActions.PRODUCT_UNPUBLISHED,
          { productId: params.id, productTitle: product.title, reason },
          { entityType: "Product", entityId: params.id },
        )
        await prisma.notification.create({
          data: {
            userId: product.creatorId,
            type: "MODERATION",
            title: "Product Unpublished",
            content: `Your product "${product.title}" has been unpublished.`,
            isRead: false,
          },
        })
        break
      case "hide":
        await prisma.$transaction(async (tx) => {
          await tx.product.update({
            where: { id: params.id },
            data: { isPublished: false, status: "HIDDEN" },
          })
          await tx.productModeration.create({
            data: {
              productId: params.id,
              actorId: ctx.id,
              action: "HIDE",
              reason: reason || null,
            },
          })
        })
        await logAdminAction(
          ctx.id,
          AuditActions.PRODUCT_UPDATED,
          { productId: params.id, productTitle: product.title, action: "hide", reason },
          { entityType: "Product", entityId: params.id },
        )
        await prisma.notification.create({
          data: {
            userId: product.creatorId,
            type: "MODERATION",
            title: "Product Hidden",
            content: `Your product "${product.title}" has been hidden from the marketplace.`,
            isRead: false,
          },
        })
        break
      case "suspend":
        await prisma.$transaction(async (tx) => {
          await tx.product.update({
            where: { id: params.id },
            data: { isPublished: false, status: "SUSPENDED" },
          })
          await tx.productModeration.create({
            data: {
              productId: params.id,
              actorId: ctx.id,
              action: "SUSPEND",
              reason: reason || null,
            },
          })
        })
        await logAdminAction(
          ctx.id,
          AuditActions.ADMIN_PRODUCT_REMOVED,
          { productId: params.id, productTitle: product.title, action: "suspend", reason },
          { entityType: "Product", entityId: params.id },
        )
        await prisma.notification.create({
          data: {
            userId: product.creatorId,
            type: "MODERATION",
            title: "Product Suspended",
            content: `Your product "${product.title}" has been suspended.`,
            isRead: false,
          },
        })
        break
      case "archive":
        await prisma.product.update({
          where: { id: params.id },
          data: { isPublished: false, status: "ARCHIVED" },
        })
        await logAdminAction(
          ctx.id,
          AuditActions.PRODUCT_UPDATED,
          { productId: params.id, productTitle: product.title, action: "archive", reason },
          { entityType: "Product", entityId: params.id },
        )
        break
      case "feature":
        await prisma.product.update({
          where: { id: params.id },
          data: { isFeatured: true },
        })
        await logAdminAction(
          ctx.id,
          AuditActions.PRODUCT_FEATURED,
          { productId: params.id, productTitle: product.title },
          { entityType: "Product", entityId: params.id },
        )
        break
      case "unfeature":
        await prisma.product.update({
          where: { id: params.id },
          data: { isFeatured: false },
        })
        await logAdminAction(
          ctx.id,
          AuditActions.PRODUCT_UNFEATURED,
          { productId: params.id, productTitle: product.title },
          { entityType: "Product", entityId: params.id },
        )
        break
      case "delete": {
        // Check for historical references that would be destroyed by hard delete
        const [orderItems, licenses, reviews, favorites] = await Promise.all([
          prisma.orderItem.count({ where: { productId: params.id } }),
          prisma.license.count({ where: { productId: params.id } }),
          prisma.review.count({ where: { productId: params.id } }),
          prisma.favorite.count({ where: { productId: params.id } }),
        ])

        const hasHistory = orderItems > 0 || licenses > 0 || reviews > 0 || favorites > 0

        if (hasHistory) {
          await prisma.product.update({
            where: { id: params.id },
            data: { status: "ARCHIVED", isPublished: false },
          })
        } else {
          await prisma.product.delete({ where: { id: params.id } })
        }

        await logAdminAction(
          ctx.id,
          AuditActions.PRODUCT_DELETED,
          { productId: params.id, productTitle: product.title, reason, softDelete: hasHistory },
          { entityType: "Product", entityId: params.id },
        )
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Product admin action error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
