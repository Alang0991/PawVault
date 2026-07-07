export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { sendRefundNotificationEmail } from "@/lib/email"

const refundSchema = z.object({
  reason: z.string().min(1).max(500),
  items: z.array(z.string()).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        buyer: {
          select: { id: true, email: true, displayName: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.buyerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (order.status === "REFUNDED" || order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Order is not eligible for a refund" },
        { status: 400 }
      )
    }

    const existing = await prisma.refund.findFirst({
      where: { orderId: order.id, status: { in: ["PENDING", "APPROVED"] } },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A refund request is already open for this order" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validated = refundSchema.parse(body)

    const amount =
      order.total ||
      order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        amount,
        reason: validated.reason,
        status: "PENDING",
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED" },
    })

    await prisma.notification.create({
      data: {
        userId: order.buyerId || user.id,
        type: "REFUND_REQUEST",
        title: "Refund request received",
        content: `We've received your refund request for order #${order.id.slice(-8)}.`,
      },
    })

    if (order.buyer?.email) {
      await sendRefundNotificationEmail(
        order.buyer.email,
        order.id.slice(-8),
        amount,
        validated.reason,
        order.buyer.displayName || undefined
      )
    }

    await createAuditLog({
      userId: user.id,
      action: AuditActions.ORDER_REFUNDED,
      details: { orderId: order.id, reason: validated.reason },
    })

    return NextResponse.json(refund, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Refund request error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
