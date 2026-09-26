export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  badgeType: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  iconUrl: z.string().optional().nullable(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const ctx = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS)
    const body = await request.json().catch(() => null)
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const badge = await prisma.creatorBadge.update({
      where: { id: params.id },
      data: parsed.data,
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { badgeId: badge.id, name: badge.name, badgeType: badge.badgeType },
      { entityType: "CreatorBadge", entityId: badge.id },
    )

    return NextResponse.json({ badge })
  } catch (error) {
    console.error("Update badge error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const ctx = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS)
    const badge = await prisma.creatorBadge.findUnique({ where: { id: params.id } })
    if (!badge) {
      return NextResponse.json({ error: "Badge not found" }, { status: 404 })
    }

    await prisma.creatorBadge.delete({ where: { id: params.id } })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { badgeId: badge.id, name: badge.name, badgeType: badge.badgeType, action: "DELETED" },
      { entityType: "CreatorBadge", entityId: badge.id },
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Delete badge error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}