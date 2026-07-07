export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  username: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  location: z.string().max(100).optional(),
})

export async function PUT(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateProfileSchema.parse(body)

    if (validated.username && validated.username !== user.username) {
      const existing = await prisma.user.findUnique({
        where: { username: validated.username },
      })
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: validated,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        website: true,
        location: true,
        avatar: true,
        role: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.USER_PROFILE_UPDATED,
      details: { updatedFields: Object.keys(validated) },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
