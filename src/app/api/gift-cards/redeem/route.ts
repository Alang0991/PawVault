export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const redeemSchema = z.object({
  code: z.string().min(1),
  orderId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const user = await requireFounder()
    const body = await request.json()
    const validated = redeemSchema.parse(body)

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: validated.code.toUpperCase() },
    })

    if (!giftCard) {
      return NextResponse.json({ error: "Invalid gift card code" }, { status: 404 })
    }

    if (!giftCard.isActive) {
      return NextResponse.json({ error: "Gift card is not active" }, { status: 400 })
    }

    if (giftCard.endsAt && giftCard.endsAt < new Date()) {
      return NextResponse.json({ error: "Gift card has expired" }, { status: 400 })
    }

    if (giftCard.maxUses && giftCard.usedCount >= giftCard.maxUses) {
      return NextResponse.json({ error: "Gift card usage limit reached" }, { status: 400 })
    }

    if (giftCard.startsAt && giftCard.startsAt > new Date()) {
      return NextResponse.json({ error: "Gift card is not yet active" }, { status: 400 })
    }

    await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: { usedCount: { increment: 1 } },
    })

    await prisma.storeCredit.create({
      data: {
        userId: user.id,
        amount: giftCard.type === "percentage" ? 0 : giftCard.value,
        currency: giftCard.currency,
        reason: `Gift card redeemed: ${giftCard.code}`,
        expiresAt: giftCard.endsAt,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.GIFT_CARD_REDEEMED,
      details: { giftCardId: giftCard.id, code: giftCard.code, userId: user.id },
      entityType: "GiftCard",
      entityId: giftCard.id,
    })

    return NextResponse.json({
      success: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        type: giftCard.type,
        value: giftCard.value,
        currency: giftCard.currency,
      },
      storeCreditCreated: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Redeem gift card error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
