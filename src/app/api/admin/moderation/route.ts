export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const moderationActionSchema = z.object({
  reportId: z.string(),
  action: z.enum(["approve", "remove", "warn", "ban", "investigate", "dismiss"]),
})

export async function GET() {
  try {
    const ctx = await requirePermission(PERMISSIONS.REPORTS_VIEW)

    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedReports = reports.map((report) => ({
      id: report.id,
      type: report.reportedType,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
      reporter: report.reporter,
      target: { id: report.reportedId, type: report.reportedType, title: report.reportedId },
    }))

    return NextResponse.json({ reports: formattedReports })
  } catch (error) {
    if (error instanceof Error && (error as any).status) {
      return NextResponse.json({ error: error.message }, { status: (error as any).status })
    }
    console.error("Get moderation reports error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.REPORTS_RESOLVE)

    const body = await request.json()
    const validated = moderationActionSchema.parse(body)

    const report = await prisma.report.findUnique({
      where: { id: validated.reportId },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    let newStatus: string
    let auditAction: string = AuditActions.ADMIN_MODERATION_ACTION
    switch (validated.action) {
      case "approve":
        newStatus = "DISMISSED"
        auditAction = AuditActions.REPORT_DISMISSED
        break
      case "remove":
        newStatus = "RESOLVED"
        auditAction = AuditActions.REPORT_RESOLVED
        break
      case "warn":
        newStatus = "RESOLVED"
        auditAction = AuditActions.REPORT_RESOLVED
        break
      case "ban":
        newStatus = "RESOLVED"
        auditAction = AuditActions.ADMIN_USER_BANNED
        break
      case "investigate":
        newStatus = "INVESTIGATING"
        auditAction = AuditActions.REPORT_INVESTIGATING
        break
      case "dismiss":
        newStatus = "DISMISSED"
        auditAction = AuditActions.REPORT_DISMISSED
        break
      default:
        newStatus = "REVIEWED"
    }

    await prisma.$transaction(async (tx) => {
      await tx.moderationAction.create({
        data: {
          reportId: validated.reportId,
          adminId: ctx.id,
          action: validated.action.toUpperCase(),
          notes: `Action taken by staff ${ctx.username}`,
        },
      })
      await tx.report.update({
        where: { id: validated.reportId },
        data: { status: newStatus },
      })
    })

    if (validated.action === "ban" && report.reportedType === "User") {
      await prisma.user.update({
        where: { id: report.reportedId },
        data: { status: "BANNED" },
      })
      await logAdminAction(
        ctx.id,
        AuditActions.ADMIN_USER_BANNED,
        { reason: report.reason, source: "moderation", reportId: report.id },
        { entityType: "User", entityId: report.reportedId },
      )
    }

    if (validated.action === "remove" && report.reportedType === "Product") {
      await prisma.product.update({
        where: { id: report.reportedId },
        data: { isPublished: false },
      })
      await logAdminAction(
        ctx.id,
        AuditActions.ADMIN_PRODUCT_REMOVED,
        { reason: report.reason, source: "moderation", reportId: report.id },
        { entityType: "Product", entityId: report.reportedId },
      )
    }

    await logAdminAction(
      ctx.id,
      auditAction,
      { action: validated.action, status: newStatus },
      { entityType: "Report", entityId: report.id },
    )

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Moderation action error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
