export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

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
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = generateSchema.parse(body)

    const isAdmin = user.role === "ADMIN"
    const targetUserId = isAdmin && validated.userId ? validated.userId : user.id

    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!isAdmin && order.buyerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.license.findFirst({
      where: {
        userId: targetUserId,
        productId: validated.productId,
        orderId: validated.orderId,
      },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const license = await prisma.license.create({
      data: {
        userId: targetUserId,
        productId: validated.productId,
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
      userId: user.id,
      action: AuditActions.ORDER_COMPLETED,
      details: { licenseId: license.id, productId: validated.productId },
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
