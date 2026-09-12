export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const createSchema = z.object({
  label: z.string().min(1).max(200),
  type: z.enum(["manual", "scheduled", "pre_restore"]).default("manual"),
  storage: z.enum(["database", "files", "full"]).default("database"),
  metadata: z.record(z.unknown()).optional(),
})

export async function GET() {
  try {
    await requireFounder()

    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        createdBy: { select: { username: true, displayName: true } },
      },
    })

    return NextResponse.json({ backups })
  } catch (error) {
    console.error("Get backups error:", error)
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

    const backup = await prisma.backup.create({
      data: {
        label: parsed.data.label,
        type: parsed.data.type,
        storage: parsed.data.storage,
        createdById: ctx.id,
        metadata: parsed.data.metadata as any,
        status: "COMPLETED",
        filePath: null,
        sizeBytes: null,
        checksum: null,
      },
      include: {
        createdBy: { select: { username: true, displayName: true } },
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { backupId: backup.id, label: backup.label, type: backup.type, storage: backup.storage },
      { entityType: "Backup", entityId: backup.id },
    )

    return NextResponse.json({ backup }, { status: 201 })
  } catch (error) {
    console.error("Create backup error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}