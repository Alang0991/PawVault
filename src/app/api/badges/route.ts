export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || user.id

    const [badges, achievements] = await Promise.all([
      prisma.creatorBadge.findMany({
        where: { userId },
        include: { user: { select: { username: true, displayName: true } } },
        orderBy: { earnedAt: "desc" },
      }),
      prisma.creatorAchievement.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ])

    return NextResponse.json({ badges, achievements })
  } catch (error) {
    console.error("Get creator badges error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

const awardSchema = z.object({
  userId: z.string().min(1),
  badgeType: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user || user.role !== "FOUNDER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const parsed = awardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const badge = await prisma.creatorBadge.create({
      data: {
        userId: parsed.data.userId,
        badgeType: parsed.data.badgeType,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        iconUrl: parsed.data.iconUrl ?? null,
      },
    })

    return NextResponse.json({ badge }, { status: 201 })
  } catch (error) {
    console.error("Award badge error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}