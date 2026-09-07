export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const toggleSchema = z.object({
  featured: z.boolean(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.CREATORS_FEATURE)

    const body = await request.json().catch(() => null)
    const parsed = toggleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, username: true, displayName: true, isFeatured: true },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.isFeatured === parsed.data.featured) {
      return NextResponse.json(
        { error: `User is already ${parsed.data.featured ? "featured" : "unfeatured"}` },
        { status: 400 },
      )
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { isFeatured: parsed.data.featured },
    })

    await logAdminAction(
      ctx.id,
      parsed.data.featured ? AuditActions.CREATOR_FEATURED : AuditActions.CREATOR_UNFEATURED,
      { userId: params.id, username: user.username },
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
    console.error("Feature creator error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
