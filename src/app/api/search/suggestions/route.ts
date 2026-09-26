export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

export async function GET(request: Request) {
  try {
    const rateLimitResult = rateLimit(request, 60, 60_000)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) },
      )
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const limitParam = parseInt(searchParams.get("limit") || "8")
    const limit = Math.min(20, Math.max(1, limitParam))

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ suggestions: [], popular: [] })
    }

    const trimmed = q.trim()

    const [products, creators, categories, popularQueries] = await Promise.all([
      prisma.product.findMany({
        where: {
          isPublished: true,
          status: "PUBLISHED",
          creator: { isInternal: false },
          OR: [
            { title: { contains: trimmed, mode: "insensitive" } },
            { subtitle: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          isFree: true,
          isOnSale: true,
          salePrice: true,
          price: true,
          media: { where: { isThumbnail: true }, take: 1, select: { url: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.user.findMany({
        where: {
          role: { in: ["CREATOR", "VERIFIED_CREATOR"] },
          creatorStatus: "APPROVED",
          status: "ACTIVE",
          isInternal: false,
          store: { visibility: "PUBLISHED" },
          OR: [
            { username: { contains: trimmed, mode: "insensitive" } },
            { displayName: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          isVerified: true,
        },
        orderBy: { salesCount: "desc" },
        take: limit,
      }),
      prisma.category.findMany({
        where: { name: { contains: trimmed, mode: "insensitive" } },
        select: { id: true, name: true, slug: true },
        take: Math.min(5, limit),
      }),
      prisma.searchAnalytics.groupBy({
        by: ["query"],
        _count: { _all: true },
        where: {
          query: { startsWith: trimmed, mode: "insensitive" },
        },
        orderBy: { _count: { query: "desc" } },
        take: 5,
      }),
    ])

    const suggestions = [
      ...products.map((p) => ({
        type: "product",
        id: p.id,
        title: p.title,
        subtitle: p.isFree ? "Free" : p.isOnSale && p.salePrice != null ? `$${p.salePrice}` : `$${p.price}`,
        href: `/product/${p.slug}`,
        image: p.media[0]?.url ?? null,
      })),
      ...creators.map((c) => ({
        type: "creator",
        id: c.id,
        title: c.displayName || c.username,
        subtitle: `@${c.username}`,
        href: `/creators/${c.username}`,
        image: c.avatar,
        isVerified: c.isVerified,
      })),
      ...categories.map((c) => ({
        type: "category",
        id: c.id,
        title: c.name,
        href: `/categories/${c.slug}`,
        image: null,
      })),
    ]

    const popular = popularQueries.map((pq) => pq.query)

    return NextResponse.json({ suggestions, popular })
  } catch (error) {
    console.error("Search suggestions error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
