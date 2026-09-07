export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { invalidateUserSessions } from "@/lib/creator-guards"
import { notifyAccountUpdate } from "@/lib/account-sync"

const creatorActionSchema = z.object({
  action: z.enum(["suspend", "unsuspend", "ban", "unban", "verify", "unverify"]),
  reason: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireFounder()

    const body = await request.json().catch(() => null)
    const parsed = creatorActionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, username: true, role: true, creatorStatus: true },
    })

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (target.role === "FOUNDER") {
      return NextResponse.json({ error: "Cannot modify Founder." }, { status: 403 })
    }

    const data: any = {}
    let auditAction: string = AuditActions.CREATOR_STATUS_CHANGED

    switch (parsed.data.action) {
      case "suspend":
        data.creatorStatus = "SUSPENDED"
        auditAction = AuditActions.CREATOR_SUSPENDED
        break
      case "unsuspend":
        data.creatorStatus = "APPROVED"
        auditAction = AuditActions.CREATOR_REINSTATED
        break
      case "ban":
        data.creatorStatus = "BANNED"
        data.status = "BANNED"
        data.bannedReason = parsed.data.reason
        auditAction = AuditActions.ADMIN_USER_BANNED
        break
      case "unban":
        data.creatorStatus = "APPROVED"
        data.status = "ACTIVE"
        data.bannedReason = null
        auditAction = AuditActions.ADMIN_USER_RESTORED
        break
      case "verify":
        data.isVerified = true
        auditAction = AuditActions.CREATOR_VERIFIED
        break
      case "unverify":
        data.isVerified = false
        auditAction = AuditActions.CREATOR_UNVERIFIED
        break
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
        reason: parsed.data.reason,
      },
      { entityType: "User", entityId: params.id }
    )

    if (params.id !== ctx.id) {
      notifyAccountUpdate()
    }

    return NextResponse.json({ user: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Creator action error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
