export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  content: z.string().max(1000).optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: params.id, isVerified: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({
        where: { productId: params.id, isVerified: true },
      }),
    ])

    const avgRating = total > 0
      ? await prisma.review.aggregate({
          where: { productId: params.id, isVerified: true },
          _avg: { rating: true },
        })
      : { _avg: { rating: 0 } }

    return NextResponse.json({
      reviews,
      avgRating: avgRating._avg.rating || 0,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get reviews error:", error)
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
    const validated = createReviewSchema.parse(body)

    const hasPurchased = await prisma.license.findFirst({
      where: {
        userId: user.id,
        productId: validated.productId,
      },
    })

    const review = await prisma.review.create({
      data: {
        productId: validated.productId,
        userId: user.id,
        rating: validated.rating,
        title: validated.title,
        content: validated.content,
        isVerified: !!hasPurchased,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create review error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
