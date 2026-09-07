import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { z } from "zod"

const updateSchema = z.object({
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  feedbackId: z.string().optional().nullable(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminOrFounder()

    const body = await request.json()
    const validated = updateSchema.parse(body)

    const item = await prisma.roadmapItem.findUnique({
      where: { id: params.id },
    })
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await prisma.roadmapItem.update({
      where: { id: params.id },
      data: validated,
    })

    await createAuditLog({
      action: AuditActions.SETTINGS_UPDATED,
      details: { type: "roadmap", itemId: item.id, updates: validated },
      entityType: "RoadmapItem",
      entityId: item.id,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Update roadmap error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminOrFounder()

    const item = await prisma.roadmapItem.findUnique({
      where: { id: params.id },
    })
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.roadmapItem.delete({ where: { id: params.id } })

    await createAuditLog({
      action: AuditActions.SETTINGS_UPDATED,
      details: { type: "roadmap", itemId: item.id, action: "delete" },
      entityType: "RoadmapItem",
      entityId: item.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete roadmap error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
