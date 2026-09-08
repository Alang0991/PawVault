export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 48)
    const sort = searchParams.get("sort") || "sales"

    const orderBy: Record<string, object> = {
      sales: { salesCount: "desc" as const },
      newest: { createdAt: "desc" as const },
      followers: { followersCount: "desc" as const },
      rating: { rating: "desc" as const },
    }

    const creators = await prisma.user.findMany({
      where: {
        creatorStatus: "APPROVED",
        status: "ACTIVE",
        isInternal: false,
        store: {
          visibility: "PUBLISHED",
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        isVerified: true,
        salesCount: true,
        rating: true,
        followersCount: true,
        store: {
          select: {
            slug: true,
            name: true,
            banner: true,
          },
        },
        _count: {
          select: {
            products: {
              where: { isPublished: true },
            },
            followers: true,
          },
        },
      },
      orderBy: orderBy[sort] || orderBy.sales,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = creators.length > limit
    const items = hasMore ? creators.slice(0, -1) : creators
    const nextCursor = hasMore ? items[items.length - 1]?.id : null

    const totalCounts = await prisma.user.aggregate({
      where: {
        creatorStatus: "APPROVED",
        status: "ACTIVE",
        isInternal: false,
        store: {
          visibility: "PUBLISHED",
        },
      },
      _count: true,
    })

    return NextResponse.json({
      creators: items.map((c) => ({
        id: c.id,
        username: c.username,
        displayName: c.displayName,
        avatar: c.avatar,
        bio: c.bio,
        isVerified: c.isVerified,
        salesCount: c.salesCount,
        rating: c.rating,
        followersCount: c.followersCount,
        store: c.store,
        productCount: c._count.products,
      })),
      nextCursor,
      hasMore,
      total: totalCounts._count,
    })
  } catch (error) {
    console.error("Get creators error:", error)
    return NextResponse.json(
      { error: "Failed to load creators" },
      { status: 500 }
    )
  }
}
