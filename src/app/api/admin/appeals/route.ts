export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const updateSchema = z.object({
  appealId: z.string().min(1),
  status: z.enum(["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED", "UPHELD"]).optional(),
  resolution: z.string().max(2000).optional(),
})

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.REPORTS_RESOLVE)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "PENDING"
    const q = searchParams.get("q")?.trim()

    const where: any = { status }
    if (q) {
      where.OR = [
        { reason: { contains: q, mode: "insensitive" } },
        { evidence: { contains: q, mode: "insensitive" } },
      ]
    }

    const appeals = await prisma.appeal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { username: true, displayName: true, email: true } },
      },
    })

    return NextResponse.json({ appeals })
  } catch (error) {
    console.error("Get appeals error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.REPORTS_RESOLVE)

    const body = await request.json().catch(() => null)
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const appeal = await prisma.appeal.update({
      where: { id: parsed.data.appealId },
      data: {
        status: parsed.data.status,
        resolution: parsed.data.resolution,
        reviewedById: ctx.id,
        reviewedAt: new Date(),
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.REPORT_RESOLVED,
      { appealId: appeal.id, status: appeal.status, resolution: appeal.resolution },
      { entityType: "Appeal", entityId: appeal.id },
    )

    return NextResponse.json({ appeal })
  } catch (error) {
    console.error("Resolve appeal error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}