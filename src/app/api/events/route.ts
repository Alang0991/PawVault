export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get("upcoming") === "true"
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"))

    const where: any = { isPublished: true }
    if (upcoming) where.endDate = { gte: new Date() }

    const events = await prisma.event.findMany({
      where,
      include: { creator: { select: { username: true, displayName: true } } },
      orderBy: { startDate: "asc" },
      take: limit,
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Get events error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}