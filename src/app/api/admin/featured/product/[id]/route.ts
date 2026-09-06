export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const toggleSchema = z.object({
  featured: z.boolean(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireAdminOrFounder()

    const body = await request.json().catch(() => null)
    const parsed = toggleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, isFeatured: true },
    })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.isFeatured === parsed.data.featured) {
      return NextResponse.json(
        { error: `Product is already ${parsed.data.featured ? "featured" : "unfeatured"}` },
        { status: 400 },
      )
    }

    await prisma.product.update({
      where: { id: params.id },
      data: { isFeatured: parsed.data.featured },
    })

    await logAdminAction(
      ctx.id,
      parsed.data.featured ? AuditActions.PRODUCT_FEATURED : AuditActions.PRODUCT_UNFEATURED,
      { productId: params.id, productTitle: product.title },
      { entityType: "Product", entityId: params.id },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Feature product error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
