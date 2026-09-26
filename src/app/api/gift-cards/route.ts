export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const createGiftCardSchema = z.object({
  code: z.string().min(1).max(50),
  type: z.enum(["fixed", "percentage"]).default("fixed"),
  value: z.number().positive(),
  currency: z.string().default("USD"),
  maxUses: z.number().int().positive().optional(),
  minPurchase: z.number().positive().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
})

export async function GET() {
  try {
    await requireFounder()
    const giftCards = await prisma.giftCard.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { id: true, username: true, displayName: true } } },
    })
    return NextResponse.json({ giftCards })
  } catch (error) {
    console.error("Get gift cards error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireFounder()
    const body = await request.json()
    const validated = createGiftCardSchema.parse(body)

    const existing = await prisma.giftCard.findUnique({ where: { code: validated.code.toUpperCase() } })
    if (existing) {
      return NextResponse.json({ error: "Gift card code already exists" }, { status: 409 })
    }

    const giftCard = await prisma.giftCard.create({
      data: {
        code: validated.code.toUpperCase(),
        type: validated.type,
        value: validated.value,
        currency: validated.currency,
        maxUses: validated.maxUses,
        minPurchase: validated.minPurchase,
        startsAt: validated.startsAt ? new Date(validated.startsAt) : undefined,
        endsAt: validated.endsAt ? new Date(validated.endsAt) : undefined,
        createdById: ctx.id,
      },
    })

    await createAuditLog({
      userId: ctx.id,
      action: AuditActions.GIFT_CARD_CREATED,
      details: { giftCardId: giftCard.id, code: giftCard.code, value: giftCard.value },
      entityType: "GiftCard",
      entityId: giftCard.id,
    })

    return NextResponse.json({ giftCard }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Create gift card error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
