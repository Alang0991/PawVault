export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireFounder()
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: params.id },
      include: { createdBy: { select: { id: true, username: true, displayName: true } } },
    })
    if (!giftCard) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 })
    }
    return NextResponse.json({ giftCard })
  } catch (error) {
    console.error("Get gift card error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await requireFounder()
    const body = await request.json()
    const updateSchema = z.object({
      isActive: z.boolean().optional(),
      maxUses: z.number().int().positive().optional(),
      value: z.number().positive().optional(),
      startsAt: z.string().datetime().optional(),
      endsAt: z.string().datetime().optional(),
    })
    const validated = updateSchema.parse(body)

    const giftCard = await prisma.giftCard.update({
      where: { id: params.id },
      data: validated,
    })

    await createAuditLog({
      userId: ctx.id,
      action: AuditActions.GIFT_CARD_UPDATED,
      details: { giftCardId: giftCard.id, changes: validated },
      entityType: "GiftCard",
      entityId: giftCard.id,
    })

    return NextResponse.json({ giftCard })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Update gift card error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await requireFounder()
    const giftCard = await prisma.giftCard.findUnique({ where: { id: params.id } })
    if (!giftCard) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 })
    }

    await prisma.giftCard.delete({ where: { id: params.id } })

    await createAuditLog({
      userId: ctx.id,
      action: AuditActions.GIFT_CARD_DELETED,
      details: { giftCardId: giftCard.id, code: giftCard.code },
      entityType: "GiftCard",
      entityId: giftCard.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete gift card error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
