export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const updateRoleSchema = z.object({
  role: z.enum(["USER", "CREATOR", "VERIFIED_CREATOR", "MODERATOR", "ADMIN", "OWNER"]),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["ADMIN", "OWNER"].includes(user.role)) {
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

    const isPromotingToAdminOrOwner = ["ADMIN", "OWNER"].includes(validated.role)
    const isSelfDemotion = target.id === user.id

    if (isPromotingToAdminOrOwner && user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the platform owner can assign ADMIN or OWNER roles." },
        { status: 403 }
      )
    }

    if (isSelfDemotion && validated.role !== "OWNER") {
      return NextResponse.json(
        { error: "You cannot remove your own OWNER role." },
        { status: 403 }
      )
    }

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
