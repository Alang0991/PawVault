export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { isFounder, isAdminOrFounder } from "@/lib/roles"

const updateRoleSchema = z.object({
  role: z.enum(["USER", "CREATOR", "VERIFIED_CREATOR", "MODERATOR", "ADMIN", "FOUNDER"]),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  return PUT(request, { params })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdminOrFounder(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateRoleSchema.parse(body)

    const target = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isSelf = target.id === user.id

    if (validated.role === "FOUNDER" && !isFounder(user.role)) {
      return NextResponse.json(
        { error: "Only the platform Founder can grant the FOUNDER role." },
        { status: 403 }
      )
    }

    if (target.role === "FOUNDER" && !isFounder(user.role)) {
      return NextResponse.json(
        { error: "Only the platform Founder can modify a Founder account." },
        { status: 403 }
      )
    }

    if (isSelf && validated.role !== user.role) {
      return NextResponse.json(
        { error: "You cannot change your own role." },
        { status: 403 }
      )
    }

    if (isFounder(target.role) && validated.role !== "FOUNDER") {
      return NextResponse.json(
        { error: "Founder role cannot be demoted. Transfer ownership only via FOUNDER_BOOTSTRAP_PASSWORD rotation." },
        { status: 403 }
      )
    }

    const previousRole = target.role

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role: validated.role },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    })

    let action: string = AuditActions.STAFF_PROMOTED
    if (["USER", "CREATOR", "VERIFIED_CREATOR"].includes(validated.role)) {
      action = AuditActions.STAFF_DEMOTED
    }

    await logAdminAction(
      user.id,
      action,
      { previousRole, newRole: validated.role, targetEmail: target.email, targetUsername: target.username },
      { entityType: "User", entityId: target.id },
    )

    return NextResponse.json({ user: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Update role error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
