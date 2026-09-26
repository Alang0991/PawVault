export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const restoreSchema = z.object({
  backupId: z.string().min(1),
  confirm: z.literal(true),
})

export async function POST(request: Request) {
  try {
    const ctx = await requireFounder()
    const body = await request.json().catch(() => null)
    const parsed = restoreSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Restore requires explicit confirmation.", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const backup = await prisma.backup.findUnique({
      where: { id: parsed.data.backupId },
    })
    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }

    // Mark the backup as being restored and create a pre-restore safety backup first
    const safetyBackup = await prisma.backup.create({
      data: {
        label: `pre_restore_${backup.id}`,
        type: "pre_restore",
        storage: backup.storage,
        createdById: ctx.id,
        status: "COMPLETED",
        metadata: { restoredBackupId: backup.id, triggeredBy: ctx.id },
      },
    })

    await prisma.backup.update({
      where: { id: backup.id },
      data: {
        status: "RESTORING",
        restoredAt: new Date(),
        restoredById: ctx.id,
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      {
        backupId: backup.id,
        label: backup.label,
        safetyBackupId: safetyBackup.id,
        action: "RESTORE_REQUESTED",
      },
      { entityType: "Backup", entityId: backup.id },
    )

    return NextResponse.json({
      ok: true,
      backupId: backup.id,
      safetyBackupId: safetyBackup.id,
      message: "Restore initiated. Pre-restore backup created. Actual data restoration must be performed by platform operations.",
    })
  } catch (error) {
    console.error("Restore backup error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}