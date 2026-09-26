import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { z } from "zod"

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  summary: z.string().max(500).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  category: z
    .enum([
      "New",
      "Improved",
      "Fixed",
      "Creator",
      "Marketplace",
      "Platform",
      "API",
    ])
    .optional(),
  releaseDate: z.string().datetime().optional(),
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

    const entry = await prisma.changelogEntry.findUnique({
      where: { id: params.id },
    })
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const data: any = { ...validated }
    if (validated.releaseDate) {
      data.releaseDate = new Date(validated.releaseDate)
    }

    const updated = await prisma.changelogEntry.update({
      where: { id: params.id },
      data,
    })

    await createAuditLog({
      action: AuditActions.ANNOUNCEMENT_UPDATED,
      details: { type: "changelog", entryId: entry.id, updates: validated },
      entityType: "ChangelogEntry",
      entityId: entry.id,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Update changelog error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminOrFounder()

    const entry = await prisma.changelogEntry.findUnique({
      where: { id: params.id },
    })
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.changelogEntry.delete({ where: { id: params.id } })

    await createAuditLog({
      action: AuditActions.ANNOUNCEMENT_DELETED,
      details: { type: "changelog", entryId: entry.id },
      entityType: "ChangelogEntry",
      entityId: entry.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete changelog error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
