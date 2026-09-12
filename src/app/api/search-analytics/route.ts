export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user || user.role !== "FOUNDER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"))
    const type = searchParams.get("type") || undefined

    const where: any = {}
    if (type) where.type = type

    const analytics = await prisma.searchAnalytics.findMany({
      where,
      include: {
        user: { select: { username: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    const totalQueries = await prisma.searchAnalytics.count()
    const topQueries = await prisma.searchAnalytics.groupBy({
      by: ["query"],
      _count: { _all: true },
      orderBy: { _count: { query: "desc" } },
      take: 20,
    })

    return NextResponse.json({ analytics, totalQueries, topQueries })
  } catch (error) {
    console.error("Get search analytics error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

const trackSchema = z.object({
  query: z.string().min(1).max(200),
  resultCount: z.number().int().default(0),
  type: z.string().default("all"),
})

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    const body = await request.json().catch(() => null)
    const parsed = trackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    await prisma.searchAnalytics.create({
      data: {
        query: parsed.data.query,
        resultCount: parsed.data.resultCount,
        type: parsed.data.type,
        userId: user?.id ?? null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Track search error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}