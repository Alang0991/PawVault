export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const moderationActionSchema = z.object({
  reportId: z.string(),
  action: z.enum(["approve", "remove", "warn", "ban"]),
})

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedReports = reports.map((report) => ({
      id: report.id,
      type: report.reportedType,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
      reporter: report.reporter,
      target: { id: report.reportedId, type: report.reportedType, title: report.reportedId },
    }))

    return NextResponse.json({ reports: formattedReports })
  } catch (error) {
    console.error("Get moderation reports error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = moderationActionSchema.parse(body)

    const report = await prisma.report.findUnique({
      where: { id: validated.reportId },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    await prisma.moderationAction.create({
      data: {
        reportId: validated.reportId,
        adminId: user.id,
        action: validated.action.toUpperCase(),
        notes: `Action taken by moderator ${user.username}`,
      },
    })

    const newStatus = 
      validated.action === 'approve' ? 'DISMISSED' :
      validated.action === 'remove' ? 'RESOLVED' : 'REVIEWED'

    await prisma.report.update({
      where: { id: validated.reportId },
      data: { status: newStatus },
    })

    if (validated.action === 'ban' && report.reportedType === 'User') {
      await prisma.user.update({
        where: { id: report.reportedId },
        data: { role: 'BANNED' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Moderation action error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
