export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const addSchema = z.object({
  productId: z.string(),
})

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await prisma.recentlyViewed.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                isVerified: true,
              },
            },
            media: { where: { isThumbnail: true }, take: 1 },
            reviews: { select: { rating: true } },
            _count: { select: { favorites: true, reviews: true } },
          },
        },
      },
      orderBy: { viewedAt: "desc" },
      take: 20,
    })

    const products = items
      .filter((item) => item.product && item.product.isPublished)
      .map((item) => {
        const p = item.product as any
        const avgRating =
          p.reviews.length > 0
            ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.reviews.length
            : 0
        return { ...p, rating: avgRating, reviewCount: p.reviews.length }
      })

    return NextResponse.json({ items: products })
  } catch (error) {
    console.error("Get recently viewed error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = addSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { productId } = parsed.data

    await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      update: { viewedAt: new Date() },
      create: { userId: user.id, productId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add recently viewed error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (productId) {
      await prisma.recentlyViewed.deleteMany({
        where: { userId: user.id, productId },
      })
    } else {
      await prisma.recentlyViewed.deleteMany({
        where: { userId: user.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Clear recently viewed error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}