export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logFounderAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"
import { notifyAccountUpdate } from "@/lib/account-sync"

const schema = z.object({
  userId: z.string(),
  action: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]),
  reason: z.string().optional(),
})

export async function POST(request: Request) {
  const ctx = await requirePermission(PERMISSIONS.STAFF_MANAGE)

  const fd = await request.formData().catch(() => null)
  let payload: any
  if (fd) {
    payload = {
      userId: fd.get("userId"),
      action: fd.get("action"),
      reason: fd.get("reason") || undefined,
    }
  } else {
    payload = await request.json().catch(() => ({}))
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } })
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (target.role === "FOUNDER") {
    return NextResponse.json({ error: "Cannot modify Founder." }, { status: 403 })
  }
  if (target.id === ctx.id) {
    return NextResponse.json({ error: "Cannot modify yourself." }, { status: 403 })
  }

  const reason = parsed.data.reason?.trim() || null

  const data: any = { status: parsed.data.action }
  if (parsed.data.action === "BANNED") {
    data.bannedReason = reason
    data.suspendedUntil = null
  } else if (parsed.data.action === "SUSPENDED") {
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
      action: parsed.data.action,
      reason,
      expiresAt: data.suspendedUntil ?? null,
    },
  })

  const auditAction =
    parsed.data.action === "BANNED" ? AuditActions.ADMIN_USER_BANNED
      : parsed.data.action === "SUSPENDED" ? AuditActions.ADMIN_USER_SUSPENDED
      : AuditActions.ADMIN_USER_RESTORED

  await logFounderAction(
    ctx.id,
    auditAction,
    { status: parsed.data.action, reason },
    { entityType: "User", entityId: target.id },
  )

  if (target.id !== ctx.id) {
    notifyAccountUpdate()
  }

  return NextResponse.json({ success: true })
}
