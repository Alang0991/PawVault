export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logFounderAction, AuditActions } from "@/lib/audit-logger"
import { notifyAccountUpdate } from "@/lib/account-sync"
import { STAFF_ROLES } from "@/lib/roles"

const ALLOWED_ROLES = STAFF_ROLES.filter((r) => r !== "FOUNDER").concat(["USER", "CREATOR", "VERIFIED_CREATOR"])

const schema = z.object({
  identifier: z.string().min(1),
  role: z.enum(ALLOWED_ROLES as [string, ...string[]]),
})

export async function POST(request: Request) {
  const ctx = await requireFounder()

  let payload: any = {}
  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    payload = await request.json().catch(() => ({}))
  } else {
    const fd = await request.formData()
    payload = { identifier: fd.get("identifier"), role: fd.get("role") }
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })
  }

  const id = parsed.data.identifier.trim().toLowerCase()
  const target = await prisma.user.findFirst({
    where: { OR: [{ email: id }, { username: id }] },
  })

  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 })
  }

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

  await logFounderAction(
    ctx.id,
    AuditActions.STAFF_CREATED,
    { previousRole, newRole: parsed.data.role, targetEmail: target.email, targetUsername: target.username },
    { entityType: "User", entityId: target.id },
  )

  if (target.id !== ctx.id) {
    notifyAccountUpdate()
  }

  return NextResponse.json({ success: true, userId: target.id })
}