export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const applyCouponSchema = z.object({
  code: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    const body = await request.json()
    const validated = applyCouponSchema.parse(body)

    const coupon = await prisma.coupon.findUnique({
      where: { code: validated.code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      )
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      )
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Apply coupon error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
