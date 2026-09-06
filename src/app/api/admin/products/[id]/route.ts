export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const patchSchema = z.object({
  action: z.enum(["publish", "unpublish", "feature", "unfeature", "delete"]),
  reason: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireAdminOrFounder()

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
        await prisma.product.update({
          where: { id: params.id },
          data: { isPublished: true },
        })
        await logAdminAction(
          ctx.id,
          AuditActions.PRODUCT_PUBLISHED,
          { productId: params.id, productTitle: product.title, reason },
          { entityType: "Product", entityId: params.id },
        )
        break
      case "unpublish":
        await prisma.product.update({
          where: { id: params.id },
          data: { isPublished: false },
        })
        await logAdminAction(
          ctx.id,
          AuditActions.PRODUCT_UNPUBLISHED,
          { productId: params.id, productTitle: product.title, reason },
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
      case "delete":
        await prisma.product.update({
          where: { id: params.id },
          data: { isPublished: false },
        })
        await logAdminAction(
          ctx.id,
          AuditActions.ADMIN_PRODUCT_REMOVED,
          { productId: params.id, productTitle: product.title, reason },
          { entityType: "Product", entityId: params.id },
        )
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Product admin action error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
