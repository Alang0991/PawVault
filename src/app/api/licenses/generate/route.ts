export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const generateSchema = z.object({
  productId: z.string(),
  orderId: z.string(),
  userId: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
})

function generateLicenseKey(): string {
  const segment = () => randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
  return `PV-${segment()}-${segment()}-${segment()}`
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.ORDERS_MANAGE)

    const body = await request.json()
    const validated = generateSchema.parse(body)

    const isAdmin = ctx.role === "FOUNDER" || ctx.role === "ADMIN"

    // Verify order exists, is completed, and includes this product
    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
      include: {
        items: {
          where: { productId: validated['productId'] },
          take: 1,
        },
        payments: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.items.length === 0) {
      return NextResponse.json(
        { error: "This product is not part of the specified order" },
        { status: 400 }
      )
    }

    // Verify payment is completed
    if (order.status !== "COMPLETED" && order.status !== "PAID") {
      return NextResponse.json(
        { error: "Order payment is not completed" },
        { status: 409 }
      )
    }

    const payments = order.payments
    const payment = Array.isArray(payments) ? payments[0] : payments
    if (!payment || payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 409 }
      )
    }

    // Determine target user: must be the order buyer unless admin override
    const buyerId = order.buyerId
    if (!buyerId) {
      return NextResponse.json({ error: "Order has no buyer" }, { status: 400 })
    }
    const targetUserId = isAdmin && validated.userId ? validated.userId : buyerId

    if (!isAdmin && order.buyerId !== ctx.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!isAdmin && targetUserId !== order.buyerId) {
      return NextResponse.json(
        { error: "License can only be issued to the order buyer" },
        { status: 403 }
      )
    }

    const existing = await prisma.license.findFirst({
      where: {
        userId: targetUserId,
        productId: validated['productId'],
        orderId: validated.orderId,
      },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const license = await prisma.license.create({
      data: {
        userId: targetUserId,
        productId: validated['productId'],
        orderId: validated.orderId,
        licenseKey: generateLicenseKey(),
        status: "ACTIVE",
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
      },
      include: {
        product: {
          select: { id: true, title: true, slug: true },
        },
      },
    })

    await createAuditLog({
      userId: ctx.id,
      action: AuditActions.ORDER_COMPLETED,
      details: {
        licenseId: license.id,
        productId: validated['productId'],
        orderId: validated.orderId,
        targetUserId,
      },
    })

    return NextResponse.json(license, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Generate license error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}