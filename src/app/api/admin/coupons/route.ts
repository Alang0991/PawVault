export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const createCouponSchema = z.object({
  code: z.string().min(1).max(50),
  type: z.enum(["percentage", "fixed"]),
  amount: z.number().positive(),
  minPurchase: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
})

export async function POST(request: Request) {
  try {
    const ctx = await requireAdminOrFounder()

    const body = await request.json().catch(() => null)
    const parsed = createCouponSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: parsed.data.code.toUpperCase(),
        type: parsed.data.type,
        amount: parsed.data.amount,
        minPurchase: parsed.data.minPurchase,
        usageLimit: parsed.data.usageLimit,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.STAFF_CREATED,
      { couponCode: coupon.code, type: coupon.type, amount: coupon.amount },
      { entityType: "Coupon", entityId: coupon.id },
    )

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Create coupon error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
