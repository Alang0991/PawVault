export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
  creatorId: z.string().optional(),
  isPublished: z.boolean().default(false),
})

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS)
    const body = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        location: parsed.data.location ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
        creatorId: parsed.data.creatorId ?? null,
        isPublished: parsed.data.isPublished,
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { eventId: event.id, title: event.title, slug: event.slug },
      { entityType: "Event", entityId: event.id },
    )

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.SYSTEM_SETTINGS)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    const where: any = {}
    if (status === "published") where.isPublished = true
    else if (status === "draft") where.isPublished = false

    const events = await prisma.event.findMany({
      where,
      include: { creator: { select: { username: true, displayName: true } } },
      orderBy: { startDate: "asc" },
      take: 100,
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Get events error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}