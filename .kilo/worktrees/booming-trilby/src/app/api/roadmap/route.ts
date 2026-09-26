import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]).default("PLANNED"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  feedbackId: z.string().optional().nullable(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")

    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority

    const items = await prisma.roadmapItem.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
      take: 100,
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Get roadmap error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrFounder()

    const body = await request.json()
    const validated = createSchema.parse(body)

    const item = await prisma.roadmapItem.create({
      data: {
        title: validated.title,
        description: validated.description,
        status: validated.status,
        priority: validated.priority,
        feedbackId: validated.feedbackId,
        createdById: (await getServerUser())?.id,
      },
    })

    await createAuditLog({
      action: AuditActions.SETTINGS_UPDATED,
      details: { type: "roadmap", itemId: item.id, title: item.title },
      entityType: "RoadmapItem",
      entityId: item.id,
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create roadmap error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
