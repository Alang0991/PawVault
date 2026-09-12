export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdminOrFounder()

    const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const [moderationRecords, moderationNotes, reports] = await Promise.all([
      prisma.userModeration.findMany({
        where: { userId: params.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.moderationNote.findMany({
        where: { userId: params.id },
        orderBy: { createdAt: "desc" },
        include: { author: { select: { username: true, displayName: true } } },
      }),
      prisma.report.findMany({
        where: { reportedId: params.id, reportedType: "USER" },
        orderBy: { createdAt: "desc" },
        include: { reporter: { select: { username: true, displayName: true } }, actions: true },
      }),
    ])

    const actorIds = [...new Set(moderationRecords.map((r) => r.actorId))]
    const actors = await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, username: true, displayName: true },
    })
    const actorMap = Object.fromEntries(actors.map((a) => [a.id, a]))

    const enriched = moderationRecords.map((r) => ({
      ...r,
      actor: actorMap[r.actorId] ?? null,
    }))

    return NextResponse.json({ moderationRecords: enriched, moderationNotes, reports })
  } catch (error) {
    console.error("Get user moderation error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}