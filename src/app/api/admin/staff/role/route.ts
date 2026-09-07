export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logFounderAction, AuditActions } from "@/lib/audit-logger"
import { notifyAccountUpdate } from "@/lib/account-sync"

const schema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "CREATOR", "VERIFIED_CREATOR", "MODERATOR", "ADMIN"]),
})

export async function POST(request: Request) {
  const ctx = await requireFounder()

  const fd = await request.formData().catch(() => null)
  let payload: any
  if (fd) {
    payload = { userId: fd.get("userId"), role: fd.get("role") }
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

  const previousRole = target.role
  await prisma.user.update({
    where: { id: target.id },
    data: { role: parsed.data.role },
  })

  const auditAction = previousRole === parsed.data.role
    ? AuditActions.STAFF_PERMISSIONS_CHANGED
    : STAFF_RANK(previousRole) > STAFF_RANK(parsed.data.role)
      ? AuditActions.STAFF_DEMOTED
      : AuditActions.STAFF_PROMOTED

  await logFounderAction(
    ctx.id,
    auditAction,
    { from: previousRole, to: parsed.data.role, targetEmail: target.email, targetUsername: target.username },
    { entityType: "User", entityId: target.id },
  )

  if (target.id !== ctx.id) {
    notifyAccountUpdate()
  }

  return NextResponse.json({ success: true })
}

function STAFF_RANK(role: string): number {
  switch (role) {
    case "FOUNDER": return 100
    case "ADMIN": return 80
    case "MODERATOR": return 60
    case "VERIFIED_CREATOR": return 45
    case "CREATOR": return 40
    default: return 10
  }
}
