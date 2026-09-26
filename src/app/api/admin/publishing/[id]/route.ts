export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const actionSchema = z.object({
  action: z.enum(["PUBLISH", "SCHEDULE", "ROLLBACK"]),
  scheduledAt: z.string().datetime().optional().nullable(),
  note: z.string().optional(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const ctx = await requireFounder()
    const body = await request.json().catch(() => null)
    const parsed = actionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const draft = await prisma.publishingDraft.findUnique({ where: { id: params.id } })
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }

    const update: any = {}
    if (parsed.data.action === "PUBLISH") {
      update.status = "PUBLISHED"
      update.publishedAt = new Date()
      update.publishedById = ctx.id
    } else if (parsed.data.action === "SCHEDULE") {
      update.status = "SCHEDULED"
      update.scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : draft.scheduledAt
    } else if (parsed.data.action === "ROLLBACK") {
      update.status = "ROLLED_BACK"
      update.rollbackOf = draft.id
    }

    const updated = await prisma.publishingDraft.update({
      where: { id: params.id },
      data: update,
      include: {
        publishedBy: { select: { username: true, displayName: true } },
      },
    })

    await logAdminAction(
      ctx.id,
      parsed.data.action === "ROLLBACK" ? AuditActions.SETTINGS_UPDATED : AuditActions.SETTINGS_UPDATED,
      {
        draftId: draft.id,
        title: draft.title,
        action: parsed.data.action,
        note: parsed.data.note,
      },
      { entityType: "PublishingDraft", entityId: draft.id },
    )

    return NextResponse.json({ draft: updated })
  } catch (error) {
    console.error("Update publishing draft error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}