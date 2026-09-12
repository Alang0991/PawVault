export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/server-auth"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { z } from "zod"

const reportProductSchema = z.object({
  reportedType: z.literal("Product"),
  reportedId: z.string().min(1).max(100),
  reason: z.string().trim().min(10).max(2000),
})

export async function POST(request: Request) {
  try {
    const rateLimitResult = rateLimit(request, 10, 60_000)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many reports. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult, 10) }
      )
    }

    const user = await requireUser()
    const parsed = reportProductSchema.safeParse(
      await request.json().catch(() => null)
    )

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: parsed.data.reportedId },
      select: { id: true, creatorId: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    if (product.creatorId === user.id) {
      return NextResponse.json(
        { error: "You cannot report your own product" },
        { status: 403 }
      )
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        reportedType: "Product",
        reportedId: parsed.data.reportedId,
        status: "PENDING",
      },
      select: { id: true },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this product" },
        { status: 409 }
      )
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        reportedType: "Product",
        reportedId: parsed.data.reportedId,
        reason: parsed.data.reason,
        status: "PENDING",
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.REPORT_CREATED,
      details: { reportedType: "Product", reportedId: report.reportedId },
      entityType: "Product",
      entityId: report.reportedId,
    })

    return NextResponse.json(
      { success: true, reportId: report.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    const status = (error as unknown as { status?: number }).status
    if (error instanceof Error && status) {
      return NextResponse.json(
        { error: error.message },
        { status }
      )
    }
    console.error("Create product report error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
