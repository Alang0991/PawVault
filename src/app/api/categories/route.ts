export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

export async function GET() {
  try {
    const rateLimitResult = rateLimit(new Request('http://localhost'), 60, 60_000)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: {
          select: {
            products: {
              where: { isPublished: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ categories }, { headers: getRateLimitHeaders(rateLimitResult) })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
