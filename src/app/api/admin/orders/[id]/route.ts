export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "PAID", "COMPLETED", "CANCELLED", "REFUNDED"]),
})

async function updateOrder(id: string, data: z.infer<typeof updateOrderSchema>, ctx: Awaited<ReturnType<typeof requireAdminOrFounder>>) {
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true, total: true },
  })
  if (!order) {
    throw new Error("Order not found")
  }

  await prisma.order.update({
    where: { id },
    data: { status: data.status },
  })

  let auditAction: string = AuditActions.ORDER_CREATED
  if (data.status === "COMPLETED") auditAction = AuditActions.ORDER_COMPLETED
  else if (data.status === "CANCELLED") auditAction = AuditActions.ORDER_CANCELLED
  else if (data.status === "REFUNDED") auditAction = AuditActions.ORDER_REFUNDED

  await logAdminAction(
    ctx.id,
    auditAction,
    { orderId: id, previousStatus: order.status, newStatus: data.status },
    { entityType: "Order", entityId: id },
  )
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireAdminOrFounder()

    const body = await request.json().catch(() => null)
    const parsed = updateOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    await updateOrder(params.id, parsed.data, ctx)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Update order error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const fd = await request.formData().catch(() => null)
  let payload: any
  if (fd) {
    const method = fd.get("_method")
    if (method === "PATCH" || method === "PUT") {
      payload = { status: fd.get("status") }
      const parsed = updateOrderSchema.safeParse(payload)
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input." }, { status: 400 })
      }
      try {
        const ctx = await requireAdminOrFounder()
        await updateOrder(params.id, parsed.data, ctx)
        return NextResponse.json({ success: true })
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
