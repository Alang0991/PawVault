export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  isPublished: z.boolean().default(false),
})

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.ANNOUNCEMENTS_MANAGE)

    const body = await request.json().catch(() => null)
    const parsed = createAnnouncementSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        authorId: ctx.id,
        isPublished: parsed.data.isPublished,
        publishedAt: parsed.data.isPublished ? new Date() : null,
      },
    })

    await logAdminAction(
      ctx.id,
      parsed.data.isPublished ? AuditActions.ANNOUNCEMENT_PUBLISHED : AuditActions.ANNOUNCEMENT_CREATED,
      { title: announcement.title, isPublished: parsed.data.isPublished },
      { entityType: "Announcement", entityId: announcement.id },
    )

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Create announcement error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
