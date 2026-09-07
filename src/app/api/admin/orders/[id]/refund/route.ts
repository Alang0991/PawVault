export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { requirePermission } from "@/lib/server-auth"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const bodySchema = z.object({
  amount: z.number().positive(),
  reason: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.REFUNDS_MANAGE)

    const fd = await request.formData().catch(() => null)
    let payload: any
    if (fd) {
      payload = {
        amount: fd.get("amount") ? parseFloat(fd.get("amount") as string) : undefined,
        reason: fd.get("reason") || undefined,
      }
    } else {
      payload = await request.json().catch(() => ({}))
    }

    const parsed = bodySchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    await logAdminAction(
      ctx.id,
      AuditActions.ORDER_REFUNDED,
      { orderId: params.id, amount: parsed.data.amount, reason: parsed.data.reason },
      { entityType: "Order", entityId: params.id },
    )

    return NextResponse.json({ success: true, message: "Refund recorded. Process payment via your payment provider." })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Admin refund error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
