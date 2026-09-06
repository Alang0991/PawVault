export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
})

async function updateAnnouncement(id: string, data: z.infer<typeof updateAnnouncementSchema>, ctx: Awaited<ReturnType<typeof requireAdminOrFounder>>) {
  const announcement = await prisma.announcement.findUnique({ where: { id } })
  if (!announcement) {
    throw new Error("Announcement not found")
  }

  const updateData: any = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.body !== undefined) updateData.body = data.body
  if (data.isPublished !== undefined) {
    updateData.isPublished = data.isPublished
    if (data.isPublished && !announcement.isPublished) {
      updateData.publishedAt = new Date()
    }
  }

  const updated = await prisma.announcement.update({ where: { id }, data: updateData })

  const wasPublished = data.isPublished && !announcement.isPublished
  await logAdminAction(
    ctx.id,
    wasPublished ? AuditActions.ANNOUNCEMENT_PUBLISHED : AuditActions.ANNOUNCEMENT_UPDATED,
    { title: updated.title, isPublished: updated.isPublished },
    { entityType: "Announcement", entityId: updated.id },
  )

  return updated
}

async function deleteAnnouncement(id: string, ctx: Awaited<ReturnType<typeof requireAdminOrFounder>>) {
  const announcement = await prisma.announcement.findUnique({ where: { id } })
  if (!announcement) {
    throw new Error("Announcement not found")
  }

  await prisma.announcement.delete({ where: { id } })

  await logAdminAction(
    ctx.id,
    AuditActions.ANNOUNCEMENT_DELETED,
    { title: announcement.title },
    { entityType: "Announcement", entityId: id },
  )
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireAdminOrFounder()

    const body = await request.json().catch(() => null)
    const parsed = updateAnnouncementSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const updated = await updateAnnouncement(params.id, parsed.data, ctx)
    return NextResponse.json({ announcement: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Update announcement error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireAdminOrFounder()

    await deleteAnnouncement(params.id, ctx)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete announcement error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const fd = await request.formData().catch(() => null)
  let payload: any
  if (fd) {
    const method = fd.get("_method")
    if (method === "PUT") {
      payload = {
        title: fd.get("title"),
        body: fd.get("body"),
        isPublished: fd.get("isPublished") === "true",
      }
      const parsed = updateAnnouncementSchema.safeParse(payload)
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input." }, { status: 400 })
      }
      try {
        const ctx = await requireAdminOrFounder()
        const updated = await updateAnnouncement(params.id, parsed.data, ctx)
        return NextResponse.json({ announcement: updated })
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
      }
    } else if (method === "DELETE") {
      try {
        const ctx = await requireAdminOrFounder()
        await deleteAnnouncement(params.id, ctx)
        return NextResponse.json({ success: true })
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
