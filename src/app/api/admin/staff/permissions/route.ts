export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logFounderAction, AuditActions } from "@/lib/audit-logger"

const schema = z.object({
  userId: z.string().min(1),
  permissions: z.string().optional(),
})

export async function POST(request: Request) {
  const ctx = await requireFounder()

  const fd = await request.formData().catch(() => null)
  let payload: any
  if (fd) {
    payload = { userId: fd.get("userId"), permissions: fd.get("permissions") }
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

  const previous = target.customPermissions ?? ""
  await prisma.user.update({
    where: { id: target.id },
    data: { customPermissions: parsed.data.permissions ?? "" },
  })

  await logFounderAction(
    ctx.id,
    AuditActions.STAFF_PERMISSIONS_CHANGED,
    { from: previous, to: parsed.data.permissions ?? "", targetEmail: target.email, targetUsername: target.username },
    { entityType: "User", entityId: target.id },
  )

  return NextResponse.json({ success: true })
}