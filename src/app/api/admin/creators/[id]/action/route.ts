export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { invalidateUserSessions } from "@/lib/creator-guards"
import { notifyAccountUpdate } from "@/lib/account-sync"
import { requireFounder, requireAdminOrFounder } from "@/lib/server-auth"
import {
  parseRequestBody,
  authorizationErrorResponse,
  authenticationErrorResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-helpers"
import { PERMISSIONS } from "@/lib/permissions"

const creatorActionSchema = z.object({
  action: z.enum(["suspend", "unsuspend", "ban", "unban", "verify", "unverify"]),
  reason: z.string().max(2000).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const parsed = await parseRequestBody(request, creatorActionSchema)
    if (!parsed.ok) return parsed.response

    let ctx
    try {
      ctx = await requireAdminOrFounder()
    } catch (authError: any) {
      const status = authError?.status
      if (status === 401) return authenticationErrorResponse(authError.message)
      if (status === 403) return authorizationErrorResponse(authError.message)
      throw authError
    }

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        creatorStatus: true,
        status: true,
        isVerified: true,
        bannedReason: true,
      },
    })

    if (!target) {
      return notFoundResponse("User not found")
    }

    if (target.role === "FOUNDER") {
      return authorizationErrorResponse("Cannot modify Founder.")
    }

    const data: any = {}
    let auditAction: string = AuditActions.CREATOR_STATUS_CHANGED
    let changed = false

    switch (parsed.data.action) {
      case "suspend":
        if (target.creatorStatus !== "SUSPENDED") {
          data.creatorStatus = "SUSPENDED"
          changed = true
        }
        auditAction = AuditActions.CREATOR_SUSPENDED
        break
      case "unsuspend":
        if (target.creatorStatus === "SUSPENDED" || target.creatorStatus === "BANNED") {
          data.creatorStatus = "APPROVED"
          changed = true
        }
        auditAction = AuditActions.CREATOR_REINSTATED
        break
      case "ban":
        if (target.status !== "BANNED" || target.creatorStatus !== "BANNED") {
          data.creatorStatus = "BANNED"
          data.status = "BANNED"
          data.bannedReason = parsed.data.reason ?? null
          changed = true
        }
        auditAction = AuditActions.ADMIN_USER_BANNED
        break
      case "unban":
        if (target.status === "BANNED" || target.creatorStatus === "BANNED") {
          data.creatorStatus = "APPROVED"
          data.status = "ACTIVE"
          data.bannedReason = null
          changed = true
        }
        auditAction = AuditActions.ADMIN_USER_RESTORED
        break
      case "verify":
        if (!target.isVerified) {
          data.isVerified = true
          changed = true
        }
        auditAction = AuditActions.CREATOR_VERIFIED
        break
      case "unverify":
        if (target.isVerified) {
          data.isVerified = false
          changed = true
        }
        auditAction = AuditActions.CREATOR_UNVERIFIED
        break
    }

    if (!changed) {
      return NextResponse.json({
        user: target,
        idempotent: true,
        message: `Already in target state for action: ${parsed.data.action}`,
      })
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        creatorStatus: true,
        isVerified: true,
        status: true,
      },
    })

    if (["ban", "suspend"].includes(parsed.data.action)) {
      await invalidateUserSessions(params.id)
    }

    await logAdminAction(
      ctx.id,
      auditAction,
      {
        userId: params.id,
        username: target.username,
        action: parsed.data.action,
        reason: parsed.data.reason ?? null,
      },
      { entityType: "User", entityId: params.id },
    )

    if (params.id !== ctx.id) {
      notifyAccountUpdate()
    }

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("Creator action error:", error)
    return serverErrorResponse()
  }
}