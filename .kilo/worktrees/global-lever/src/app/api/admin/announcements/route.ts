export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  isPublished: z.boolean().default(false),
  scheduledAt: z.string().datetime().optional().nullable(),
  isPinned: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(0),
})

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.ANNOUNCEMENTS_MANAGE)

    const body = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input.", details: parsed.error.flatten() }, { status: 400 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        authorId: ctx.id,
        isPublished: parsed.data.isPublished,
        publishedAt: parsed.data.isPublished ? new Date() : null,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
        isPinned: parsed.data.isPinned,
        priority: parsed.data.priority,
      },
    })

    await logAdminAction(
      ctx.id,
      parsed.data.isPublished ? AuditActions.ANNOUNCEMENT_PUBLISHED : AuditActions.ANNOUNCEMENT_CREATED,
      {
        title: announcement.title,
        isPublished: parsed.data.isPublished,
        scheduledAt: parsed.data.scheduledAt,
        isPinned: parsed.data.isPinned,
      },
      { entityType: "Announcement", entityId: announcement.id },
    )

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (error) {
    console.error("Create announcement error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.ANNOUNCEMENTS_MANAGE)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    const where: any = {}
    if (status === "published") where.isPublished = true
    else if (status === "draft") where.isPublished = false
    else if (status === "scheduled") {
      where.isPublished = false
      where.scheduledAt = { gt: new Date() }
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
      include: { author: { select: { username: true, displayName: true } } },
    })

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error("Get announcements error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}