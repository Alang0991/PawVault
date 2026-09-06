export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const permissionsSchema = z.object({
  userId: z.string(),
  permissions: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    await requireFounder()

    const fd = await request.formData().catch(() => null)
    let payload: any
    if (fd) {
      payload = { userId: fd.get("userId"), permissions: fd.get("permissions") }
    } else {
      payload = await request.json().catch(() => ({}))
    }

    const parsed = permissionsSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } })
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (target.role === "FOUNDER") {
      return NextResponse.json({ error: "Cannot modify Founder." }, { status: 403 })
    }

    const permissionsValue = parsed.data.permissions?.trim() || null

    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { customPermissions: permissionsValue },
    })

    await logAdminAction(
      target.id,
      AuditActions.STAFF_PERMISSIONS_CHANGED,
      { userId: parsed.data.userId, customPermissions: permissionsValue },
      { entityType: "User", entityId: parsed.data.userId },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Update permissions error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
