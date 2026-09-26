export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || undefined
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"))

    const where: any = { isPublished: true }
    if (category) where.category = category

    const news = await prisma.platformNews.findMany({
      where,
      include: { author: { select: { username: true, displayName: true } } },
      orderBy: { publishedAt: "desc" },
      take: limit,
    })

    const categories = Array.from(
      new Set((await prisma.platformNews.findMany({ where: { isPublished: true }, select: { category: true } })).map((n) => n.category))
    )

    return NextResponse.json({ news, categories })
  } catch (error) {
    console.error("Get news error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}