export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  creatorId: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const ctx = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS)
    const body = await request.json().catch(() => null)
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const data: any = { ...parsed.data }
    if (parsed.data.startDate) data.startDate = new Date(parsed.data.startDate)
    if (parsed.data.endDate) data.endDate = new Date(parsed.data.endDate)

    const event = await prisma.event.update({
      where: { id: params.id },
      data,
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { eventId: event.id, title: event.title, isPublished: event.isPublished },
      { entityType: "Event", entityId: event.id },
    )

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Update event error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const ctx = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS)
    const event = await prisma.event.findUnique({ where: { id: params.id } })
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    await prisma.event.delete({ where: { id: params.id } })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { eventId: event.id, title: event.title, action: "DELETED" },
      { entityType: "Event", entityId: event.id },
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Delete event error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}