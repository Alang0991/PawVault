export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const createNoteSchema = z.object({
  userId: z.string().optional(),
  productId: z.string().optional(),
  reportId: z.string().optional(),
  body: z.string().min(1),
})

export async function GET(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.REPORTS_VIEW)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const productId = searchParams.get("productId")
    const reportId = searchParams.get("reportId")

    const where: any = {}
    if (userId) where.userId = userId
    if (productId) where.productId = productId
    if (reportId) where.reportId = reportId

    const notes = await prisma.moderationNote.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, displayName: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ notes })
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Get moderation notes error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.REPORTS_RESOLVE)

    const body = await request.json()
    const validated = createNoteSchema.parse(body)

    if (!validated.userId && !validated.productId && !validated.reportId) {
      return NextResponse.json(
        { error: "At least one of userId, productId, or reportId is required" },
        { status: 400 },
      )
    }

    const note = await prisma.moderationNote.create({
      data: {
        userId: validated.userId,
        productId: validated.productId,
        reportId: validated.reportId,
        body: validated.body,
        authorId: ctx.id,
      },
      include: {
        author: { select: { id: true, username: true, displayName: true, role: true } },
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.MODERATION_NOTE_ADDED,
      { userId: validated.userId, productId: validated.productId, reportId: validated.reportId },
      { entityType: "ModerationNote", entityId: note.id },
    )

    return NextResponse.json({ note }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Create moderation note error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
