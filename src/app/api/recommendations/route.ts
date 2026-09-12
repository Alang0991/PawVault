export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const querySchema = z.object({
  userId: z.string().optional(),
  type: z.string().optional(),
  limit: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()))
    const q = parsed.data ?? {}

    const limit = Math.min(50, parseInt(q.limit || "12"))
    const userId = q.userId || user?.id

    const where: any = {}
    if (userId) where.userId = userId
    if (q.type) where.type = q.type

    const recs = await prisma.recommendation.findMany({
      where,
      include: {
        product: {
          include: {
            creator: { select: { username: true, displayName: true } },
            media: { take: 1, where: { type: "image" } },
          },
        },
      },
      orderBy: { score: "desc" },
      take: limit,
    })

    return NextResponse.json({
      recommendations: recs.map((r) => ({
        id: r.id,
        productId: r.product.id,
        title: r.product.title,
        slug: r.product.slug,
        price: r.product.price,
        salePrice: r.product.salePrice,
        isOnSale: r.product.isOnSale,
        isFree: r.product.isFree,
        creator: r.product.creator,
        imageUrl: r.product.media[0]?.url ?? null,
        score: r.score,
        reason: r.reason,
        type: r.type,
      })),
    })
  } catch (error) {
    console.error("Get recommendations error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

const trackSchema = z.object({
  productId: z.string().min(1),
  type: z.string().default("similar"),
  reason: z.string().optional(),
  score: z.number().default(0),
})

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const parsed = trackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const rec = await prisma.recommendation.upsert({
      where: {
        userId_productId_type: {
          userId: user.id,
          productId: parsed.data?.productId,
          type: parsed.data?.type,
        },
      },
      update: { score: parsed.data?.score },
      create: {
        userId: user.id,
        productId: parsed.data?.productId,
        type: parsed.data?.type,
        reason: parsed.data?.reason,
        score: parsed.data?.score,
      },
    })

    return NextResponse.json({ ok: true, recommendationId: rec.id })
  } catch (error) {
    console.error("Track recommendation error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}