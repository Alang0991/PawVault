export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            followersCount: true,
          },
        },
        products: {
          where: { isPublished: true },
          include: {
            media: {
              where: { isThumbnail: true },
              take: 1,
            },
            reviews: {
              select: {
                rating: true,
              },
            },
            _count: {
              select: {
                favorites: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!store) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      )
    }

    const productsWithRating = store.products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        rating: avgRating,
        reviewCount: product.reviews.length,
      }
    })

    return NextResponse.json({
      ...store,
      products: productsWithRating,
    })
  } catch (error) {
    console.error("Get store error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
