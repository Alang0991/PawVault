export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import {
  sendCreatorApplicationApprovedEmail,
  sendCreatorApplicationRejectedEmail,
  sendCreatorApplicationChangesRequestedEmail,
} from "@/lib/email"
import { notifyAccountUpdate } from "@/lib/account-sync"

const applicationActionSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes", "under_review"]),
  notes: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireFounder()

    const body = await request.json().catch(() => null)
    const parsed = applicationActionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const application = await prisma.creatorApplication.findUnique({
      where: { id: params.id },
      include: { user: { select: { id: true, username: true, email: true, displayName: true } } },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const allowedStatuses = ["PENDING", "UNDER_REVIEW"]
    if (!allowedStatuses.includes(application.status) && parsed.data.action !== "request_changes") {
      return NextResponse.json(
        { error: `Application is already ${application.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    let newStatus = application.status
    let auditAction: string = AuditActions.CREATOR_APPLICATION_REVIEWED

    switch (parsed.data.action) {
      case "approve":
        newStatus = "APPROVED"
        auditAction = AuditActions.CREATOR_APPLICATION_APPROVED
        break
      case "reject":
        newStatus = "REJECTED"
        auditAction = AuditActions.CREATOR_APPLICATION_REJECTED
        break
      case "request_changes":
        newStatus = "PENDING"
        auditAction = AuditActions.CREATOR_APPLICATION_REVIEWED
        break
      case "under_review":
        newStatus = "UNDER_REVIEW"
        auditAction = AuditActions.CREATOR_APPLICATION_REVIEWED
        break
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.creatorApplication.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          reviewedById: ctx.id,
          reviewedAt: new Date(),
          notes: parsed.data.notes,
        },
      })

      if (newStatus === "APPROVED") {
        await tx.user.update({
          where: { id: application.userId },
          data: {
            role: "CREATOR",
            creatorStatus: "APPROVED",
          },
        })
      }

      return app
    })

    await logAdminAction(
      ctx.id,
      auditAction,
      {
        applicationId: params.id,
        userId: application.userId,
        username: application.user.username,
        action: parsed.data.action,
        notes: parsed.data.notes,
      },
      { entityType: "CreatorApplication", entityId: params.id }
    )

    notifyAccountUpdate()

    if (parsed.data.action === "approve") {
      sendCreatorApplicationApprovedEmail(
        application.user.email,
        application.user.displayName || application.user.username
      ).catch((err) => console.error("Failed to send approval email:", err))
    } else if (parsed.data.action === "reject") {
      sendCreatorApplicationRejectedEmail(
        application.user.email,
        application.user.displayName || application.user.username,
        parsed.data.notes
      ).catch((err) => console.error("Failed to send rejection email:", err))
    } else if (parsed.data.action === "request_changes") {
      sendCreatorApplicationChangesRequestedEmail(
        application.user.email,
        application.user.displayName || application.user.username,
        parsed.data.notes
      ).catch((err) => console.error("Failed to send changes requested email:", err))
    }

    return NextResponse.json({ success: true, application: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Application action error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
