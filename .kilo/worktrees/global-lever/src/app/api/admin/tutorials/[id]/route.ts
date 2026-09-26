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
  summary: z.string().optional().nullable(),
  body: z.string().min(1).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  readTime: z.number().int().min(1).optional().nullable(),
  isPublished: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
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
    if (parsed.data.isPublished) {
      const existing = await prisma.tutorial.findUnique({ where: { id: params.id } })
      if (existing && !existing.isPublished) {
        data.publishedAt = new Date()
      }
    }

    const tutorial = await prisma.tutorial.update({
      where: { id: params.id },
      data,
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { tutorialId: tutorial.id, title: tutorial.title, isPublished: tutorial.isPublished },
      { entityType: "Tutorial", entityId: tutorial.id },
    )

    return NextResponse.json({ tutorial })
  } catch (error) {
    console.error("Update tutorial error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const ctx = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS)
    const tutorial = await prisma.tutorial.findUnique({ where: { id: params.id } })
    if (!tutorial) {
      return NextResponse.json({ error: "Tutorial not found" }, { status: 404 })
    }

    await prisma.tutorial.delete({ where: { id: params.id } })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { tutorialId: tutorial.id, title: tutorial.title, action: "DELETED" },
      { entityType: "Tutorial", entityId: tutorial.id },
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Delete tutorial error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}