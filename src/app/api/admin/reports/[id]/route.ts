export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const reportActionSchema = z.object({
  action: z.enum(["approve", "remove", "warn", "ban", "investigate", "dismiss"]),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireAdminOrFounder()

    const fd = await request.formData().catch(() => null)
    let payload: any
    if (fd) {
      payload = { action: fd.get("action") }
    } else {
      payload = await request.json().catch(() => ({}))
    }

    const parsed = reportActionSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id },
    })
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    let newStatus: string
    let auditAction: string = AuditActions.ADMIN_MODERATION_ACTION
    switch (parsed.data.action) {
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
          reportId: params.id,
          adminId: ctx.id,
          action: parsed.data.action.toUpperCase(),
          notes: `Action taken by staff ${ctx.id}`,
        },
      })
      await tx.report.update({
        where: { id: params.id },
        data: { status: newStatus },
      })
    })

    if (parsed.data.action === "ban" && report.reportedType === "User") {
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

    if (parsed.data.action === "remove" && report.reportedType === "Product") {
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
      { action: parsed.data.action, status: newStatus },
      { entityType: "Report", entityId: report.id },
    )

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Report action error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
