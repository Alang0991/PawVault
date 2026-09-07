export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import {
  sendCreatorApplicationApprovedEmail,
  sendCreatorApplicationRejectedEmail,
  sendCreatorApplicationChangesRequestedEmail,
} from "@/lib/email"
import { notifyAccountUpdate } from "@/lib/account-sync"
import {
  requireCreatorApprovalApprove,
  requireCreatorApprovalReject,
  requireCreatorApprovalReview,
} from "@/lib/server-auth"
import {
  parseRequestBody,
  authorizationErrorResponse,
  authenticationErrorResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-helpers"

const applicationActionSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes", "under_review"]),
  notes: z.string().max(2000).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const parsed = await parseRequestBody(request, applicationActionSchema)
    if (!parsed.ok) return parsed.response

    const action = parsed.data.action
    let ctx
    try {
      if (action === "approve") {
        ctx = await requireCreatorApprovalApprove()
      } else if (action === "reject") {
        ctx = await requireCreatorApprovalReject()
      } else {
        ctx = await requireCreatorApprovalReview()
      }
    } catch (authError: any) {
      const status = authError?.status
      if (status === 401) return authenticationErrorResponse(authError.message)
      if (status === 403) return authorizationErrorResponse(authError.message)
      throw authError
    }

    const application = await prisma.creatorApplication.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, username: true, email: true, displayName: true, role: true, creatorStatus: true },
        },
      },
    })

    if (!application) {
      return notFoundResponse("Application not found")
    }

    if (!application.user) {
      return notFoundResponse("Application user not found")
    }

    const currentStatus = application.status
    const isAlreadyFinal = currentStatus === "APPROVED" || currentStatus === "REJECTED"

    if (isAlreadyFinal) {
      return NextResponse.json(
        {
          success: true,
          application,
          idempotent: true,
          message: `Application is already ${currentStatus.toLowerCase()}`,
        },
        { status: 200 },
      )
    }

    const allowedStatuses = ["PENDING", "UNDER_REVIEW"]
    if (!allowedStatuses.includes(currentStatus)) {
      return NextResponse.json(
        { error: `Application is in unexpected status ${currentStatus}` },
        { status: 409 },
      )
    }

    let newStatus = currentStatus
    let auditAction: string = AuditActions.CREATOR_APPLICATION_REVIEWED

    switch (action) {
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
          notes: parsed.data.notes ?? null,
        },
      })

      if (newStatus === "APPROVED") {
        await tx.user.update({
          where: { id: application.userId },
          data: {
            role: application.user.role === "FOUNDER" ? application.user.role : "CREATOR",
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
        action,
        notes: parsed.data.notes ?? null,
        previousStatus: currentStatus,
        newStatus,
      },
      { entityType: "CreatorApplication", entityId: params.id },
    )

    notifyAccountUpdate()

    if (action === "approve") {
      sendCreatorApplicationApprovedEmail(
        application.user.email,
        application.user.displayName || application.user.username,
      ).catch((err) => console.error("Failed to send approval email:", err))
    } else if (action === "reject") {
      sendCreatorApplicationRejectedEmail(
        application.user.email,
        application.user.displayName || application.user.username,
        parsed.data.notes,
      ).catch((err) => console.error("Failed to send rejection email:", err))
    } else if (action === "request_changes") {
      sendCreatorApplicationChangesRequestedEmail(
        application.user.email,
        application.user.displayName || application.user.username,
        parsed.data.notes,
      ).catch((err) => console.error("Failed to send changes requested email:", err))
    }

    return NextResponse.json({ success: true, application: updated })
  } catch (error) {
    console.error("Application action error:", error)
    return serverErrorResponse()
  }
}