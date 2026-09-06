export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const applicationActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requireFounder()

    const body = await request.json().catch(() => null)
    const parsed = applicationActionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const application = await prisma.creatorApplication.findUnique({
      where: { id: params.id },
      include: { user: { select: { id: true, username: true, email: true } } },
    })
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (application.status !== "PENDING") {
      return NextResponse.json(
        { error: `Application is already ${application.status.toLowerCase()}` },
        { status: 400 },
      )
    }

    if (parsed.data.action === "approve") {
      await prisma.$transaction(async (tx) => {
        await tx.creatorApplication.update({
          where: { id: params.id },
          data: {
            status: "APPROVED",
            reviewedById: ctx.id,
            reviewedAt: new Date(),
            notes: parsed.data.notes,
          },
        })
        await tx.user.update({
          where: { id: application.userId },
          data: { role: "CREATOR" },
        })
      })

      await logAdminAction(
        ctx.id,
        AuditActions.CREATOR_APPLICATION_APPROVED,
        { applicationId: params.id, userId: application.userId, username: application.user.username, notes: parsed.data.notes },
        { entityType: "CreatorApplication", entityId: params.id },
      )
    } else {
      await prisma.creatorApplication.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          reviewedById: ctx.id,
          reviewedAt: new Date(),
          notes: parsed.data.notes,
        },
      })

      await logAdminAction(
        ctx.id,
        AuditActions.CREATOR_APPLICATION_REJECTED,
        { applicationId: params.id, userId: application.userId, username: application.user.username, notes: parsed.data.notes },
        { entityType: "CreatorApplication", entityId: params.id },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Application action error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
