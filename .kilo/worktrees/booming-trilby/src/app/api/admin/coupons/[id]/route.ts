export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const updateCouponSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  type: z.enum(["percentage", "fixed"]).optional(),
  amount: z.number().positive().optional(),
  minPurchase: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
})

async function updateCoupon(id: string, data: z.infer<typeof updateCouponSchema>, ctx: Awaited<ReturnType<typeof requirePermission>>) {
  const coupon = await prisma.coupon.findUnique({ where: { id } })
  if (!coupon) {
    throw new Error("Coupon not found")
  }

  const updateData: any = {}
  if (data.code !== undefined) updateData.code = data.code.toUpperCase()
  if (data.type !== undefined) updateData.type = data.type
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.minPurchase !== undefined) updateData.minPurchase = data.minPurchase
  if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit
  if (data.expiresAt !== undefined) {
    updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null
  }

  const updated = await prisma.coupon.update({ where: { id }, data: updateData })

  await logAdminAction(
    ctx.id,
    AuditActions.STAFF_PERMISSIONS_CHANGED,
    { couponCode: updated.code, changes: data },
    { entityType: "Coupon", entityId: updated.id },
  )

  return updated
}

async function deleteCoupon(id: string, ctx: Awaited<ReturnType<typeof requirePermission>>) {
  const coupon = await prisma.coupon.findUnique({ where: { id } })
  if (!coupon) {
    throw new Error("Coupon not found")
  }

  await prisma.coupon.delete({ where: { id } })

  await logAdminAction(
    ctx.id,
    AuditActions.STAFF_REMOVED,
    { couponCode: coupon.code },
    { entityType: "Coupon", entityId: id },
  )
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.DISCOUNTS_MANAGE)

    const body = await request.json().catch(() => null)
    const parsed = updateCouponSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const updated = await updateCoupon(params.id, parsed.data, ctx)
    return NextResponse.json({ coupon: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Update coupon error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.DISCOUNTS_MANAGE)

    await deleteCoupon(params.id, ctx)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete coupon error:", error)
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
    if (method === "PUT") {
      payload = {
        code: fd.get("code"),
        type: fd.get("type"),
        amount: fd.get("amount") ? parseFloat(fd.get("amount") as string) : undefined,
        minPurchase: fd.get("minPurchase") ? parseFloat(fd.get("minPurchase") as string) : null,
        usageLimit: fd.get("usageLimit") ? parseInt(fd.get("usageLimit") as string) : null,
        expiresAt: fd.get("expiresAt") || null,
      }
      const parsed = updateCouponSchema.safeParse(payload)
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input." }, { status: 400 })
      }
      try {
        const ctx = await requirePermission(PERMISSIONS.DISCOUNTS_MANAGE)
        const updated = await updateCoupon(params.id, parsed.data, ctx)
        return NextResponse.json({ coupon: updated })
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
      }
    } else if (method === "DELETE") {
      try {
        const ctx = await requirePermission(PERMISSIONS.DISCOUNTS_MANAGE)
        await deleteCoupon(params.id, ctx)
        return NextResponse.json({ success: true })
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
