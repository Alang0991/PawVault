export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]),
  reason: z.string().optional(),
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
      payload = {
        status: fd.get("status"),
        reason: fd.get("reason") || undefined,
      }
    } else {
      payload = await request.json().catch(() => ({}))
    }

    const parsed = statusSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const target = await prisma.user.findUnique({ where: { id: params.id } })
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (target.role === "FOUNDER") {
      return NextResponse.json({ error: "Cannot modify Founder." }, { status: 403 })
    }
    if (target.id === ctx.id) {
      return NextResponse.json({ error: "Cannot modify yourself." }, { status: 403 })
    }

    const reason = parsed.data.reason?.trim() || null

    const data: any = { status: parsed.data.status }
    if (parsed.data.status === "BANNED") {
      data.bannedReason = reason
      data.suspendedUntil = null
    } else if (parsed.data.status === "SUSPENDED") {
      data.suspendedReason = reason
      data.suspendedUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    } else {
      data.suspendedUntil = null
      data.suspendedReason = null
      data.bannedReason = null
    }

    await prisma.user.update({ where: { id: target.id }, data })
    await prisma.userModeration.create({
      data: {
        userId: target.id,
        actorId: ctx.id,
        action: parsed.data.status,
        reason,
        expiresAt: data.suspendedUntil ?? null,
      },
    })

    const auditAction =
      parsed.data.status === "BANNED" ? AuditActions.ADMIN_USER_BANNED
        : parsed.data.status === "SUSPENDED" ? AuditActions.ADMIN_USER_SUSPENDED
        : AuditActions.ADMIN_USER_RESTORED

    await logAdminAction(
      ctx.id,
      auditAction,
      { status: parsed.data.status, reason },
      { entityType: "User", entityId: target.id },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Update user status error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
