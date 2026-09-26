export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const createSchema = z.object({
  severity: z.enum(["INFO", "WARNING", "ERROR", "CRITICAL"]),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  source: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export async function GET() {
  try {
    await requireFounder()

    const [activeAlerts, recentMetrics] = await Promise.all([
      prisma.systemAlert.findMany({
        where: { resolvedAt: null },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 50,
      }),
      prisma.systemMetric.findMany({
        orderBy: { recordedAt: "desc" },
        take: 100,
      }),
    ])

    const severityOrder: Record<string, number> = { CRITICAL: 0, ERROR: 1, WARNING: 2, INFO: 3 }
    activeAlerts.sort((a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99))

    const metricsByType: Record<string, any[]> = {}
    for (const m of recentMetrics) {
      if (!metricsByType[m.metricType]) metricsByType[m.metricType] = []
      metricsByType[m.metricType].push(m)
    }

    return NextResponse.json({ activeAlerts, metricsByType })
  } catch (error) {
    console.error("Get monitoring error:", error)
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

    const alert = await prisma.systemAlert.create({
      data: {
        severity: parsed.data.severity,
        title: parsed.data.title,
        message: parsed.data.message,
        source: parsed.data.source ?? null,
        metadata: parsed.data.metadata as any,
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SECURITY_SUSPICIOUS_ACTIVITY,
      { alertId: alert.id, severity: alert.severity, title: alert.title },
      { entityType: "SystemAlert", entityId: alert.id },
    )

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    console.error("Create alert error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireFounder()
    const body = await request.json().catch(() => null)
    const idSchema = z.object({ alertId: z.string().min(1), action: z.enum(["ACKNOWLEDGE", "RESOLVE"]) })
    const parsed = idSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const update: any = {}
    if (parsed.data.action === "ACKNOWLEDGE") {
      update.acknowledged = true
      update.acknowledgedAt = new Date()
      update.acknowledgedBy = ctx.id
    } else {
      update.resolvedAt = new Date()
      update.resolvedBy = ctx.id
    }

    const alert = await prisma.systemAlert.update({
      where: { id: parsed.data.alertId },
      data: update,
    })

    await logAdminAction(
      ctx.id,
      parsed.data.action === "ACKNOWLEDGE" ? AuditActions.SECURITY_SUSPICIOUS_ACTIVITY : AuditActions.SECURITY_SUSPICIOUS_ACTIVITY,
      { alertId: alert.id, action: parsed.data.action },
      { entityType: "SystemAlert", entityId: alert.id },
    )

    return NextResponse.json({ alert })
  } catch (error) {
    console.error("Update alert error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}