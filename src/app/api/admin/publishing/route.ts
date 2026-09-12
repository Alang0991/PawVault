export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const createSchema = z.object({
  resourceType: z.string().min(1).default("homepage_section"),
  resourceId: z.string().optional(),
  title: z.string().min(1).max(200),
  summary: z.string().optional(),
  changes: z.record(z.unknown()),
  previousVersion: z.record(z.unknown()).optional(),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "SCHEDULED", "PUBLISHED", "ROLLED_BACK"]).default("DRAFT"),
  scheduledAt: z.string().datetime().optional().nullable(),
})

export async function GET(request: Request) {
  try {
    await requireFounder()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    const where: any = {}
    if (status !== "all") where.status = status

    const drafts = await prisma.publishingDraft.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        publishedBy: { select: { username: true, displayName: true } },
      },
    })

    return NextResponse.json({ drafts })
  } catch (error) {
    console.error("Get publishing drafts error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireFounder()
    const body = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const draft = await prisma.publishingDraft.create({
      data: {
        resourceType: parsed.data.resourceType,
        resourceId: parsed.data.resourceId ?? null,
        title: parsed.data.title,
        summary: parsed.data.summary ?? null,
        changes: parsed.data.changes as any,
        previousVersion: parsed.data.previousVersion as any,
        status: parsed.data.status,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
        publishedById: parsed.data.status === "PUBLISHED" ? ctx.id : null,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        publishedBy: { select: { username: true, displayName: true } },
      },
    })

    await logAdminAction(
      ctx.id,
      parsed.data.status === "PUBLISHED" ? AuditActions.SETTINGS_UPDATED : AuditActions.SETTINGS_UPDATED,
      {
        draftId: draft.id,
        title: draft.title,
        resourceType: draft.resourceType,
        status: draft.status,
      },
      { entityType: "PublishingDraft", entityId: draft.id },
    )

    return NextResponse.json({ draft }, { status: 201 })
  } catch (error) {
    console.error("Create publishing draft error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}