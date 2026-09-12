export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const updateSchema = z.object({
  suspiciousLoginDetection: z.boolean().optional(),
  forcePasswordChange: z.boolean().optional(),
  maxLoginAttempts: z.number().int().min(1).optional(),
  lockoutDuration: z.number().int().min(1).optional(),
  sessionTimeout: z.number().int().min(1).optional(),
  maxConcurrentSessions: z.number().int().min(1).optional(),
  forceReauth: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  siteShutdown: z.boolean().optional(),
  emailSecurityAlerts: z.boolean().optional(),
  logAllAdminActions: z.boolean().optional(),
  auditSensitiveChanges: z.boolean().optional(),
  autoBackupEnabled: z.boolean().optional(),
  backupFrequency: z.string().optional(),
  retentionDays: z.number().int().min(1).optional(),
})

export async function GET() {
  try {
    await requireFounder()
    const config = await prisma.siteSetting.findMany({
      where: { key: { startsWith: "security." } },
    })
    const settings: any = {}
    for (const s of config) {
      try {
        settings[s.key.replace("security.", "")] = JSON.parse(s.value)
      } catch {
        settings[s.key.replace("security.", "")] = s.value
      }
    }
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Get security settings error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireFounder()
    const body = await request.json().catch(() => null)
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const operations = Object.entries(parsed.data).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key: `security.${key}` },
        update: { value: JSON.stringify(value), updatedBy: ctx.id },
        create: { key: `security.${key}`, value: JSON.stringify(value), updatedBy: ctx.id },
      }),
    )

    await prisma.$transaction(operations)

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { changes: parsed.data },
      { entityType: "SiteSetting", entityId: "security" },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update security settings error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}