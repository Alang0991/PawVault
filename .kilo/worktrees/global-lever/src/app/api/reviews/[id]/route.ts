export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

async function recalculateCreatorRatingForReview(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { productId: true },
  })

  if (!review) return

  const product = await prisma.product.findUnique({
    where: { id: review.productId },
    select: { creatorId: true },
  })

  if (!product?.creatorId) return

  const avgResult = await prisma.review.aggregate({
    where: {
      product: { creatorId: product.creatorId },
      isVerified: true,
    },
    _avg: { rating: true },
  })

  const avgRating = avgResult._avg.rating ?? 0

  await prisma.user.update({
    where: { id: product.creatorId },
    data: { rating: Number(avgRating.toFixed(2)) },
  })
}

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  content: z.string().max(1000).optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ageDays =
      (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    if (ageDays > 30) {
      return NextResponse.json(
        { error: "Reviews can only be edited within 30 days" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = updateReviewSchema.parse(body)

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: validated,
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

    await recalculateCreatorRatingForReview(params.id)

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Update review error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ageDays =
      (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    if (ageDays > 30) {
      return NextResponse.json(
        { error: "Reviews can only be deleted within 30 days" },
        { status: 403 }
      )
    }

    await prisma.review.delete({
      where: { id: params.id },
    })

    await recalculateCreatorRatingForReview(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete review error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
