export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const createCouponSchema = z.object({
  code: z.string().min(1).max(50),
  type: z.enum(["percentage", "fixed"]),
  amount: z.number().positive(),
  minPurchase: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
})

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const coupons = await prisma.coupon.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error("Get coupons error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createCouponSchema.parse(body)

    const coupon = await prisma.coupon.create({
      data: {
        code: validated.code.toUpperCase(),
        type: validated.type,
        amount: validated.amount,
        minPurchase: validated.minPurchase,
        usageLimit: validated.usageLimit,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : undefined,
        creatorId: user.id,
      },
    })

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create coupon error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
