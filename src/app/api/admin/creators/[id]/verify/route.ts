export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const verifySchema = z.object({
  verified: z.boolean(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireFounder()

    const body = await request.json().catch(() => null)
    const parsed = verifySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, username: true, email: true, role: true, isVerified: true },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "CREATOR" && user.role !== "VERIFIED_CREATOR") {
      return NextResponse.json({ error: "User is not a creator" }, { status: 400 })
    }

    const previousVerified = user.isVerified
    const newRole = parsed.data.verified ? "VERIFIED_CREATOR" : "CREATOR"

    await prisma.user.update({
      where: { id: params.id },
      data: {
        isVerified: parsed.data.verified,
        ...(parsed.data.verified && user.role === "CREATOR" ? { role: "VERIFIED_CREATOR" } : {}),
        ...(!parsed.data.verified && user.role === "VERIFIED_CREATOR" ? { role: "CREATOR" } : {}),
      },
    })

    await logAdminAction(
      ctx.id,
      parsed.data.verified ? AuditActions.CREATOR_VERIFIED : AuditActions.CREATOR_UNVERIFIED,
      { userId: params.id, username: user.username, previousVerified },
      { entityType: "User", entityId: params.id },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Verify creator error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
