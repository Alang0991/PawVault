export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function GET() {
  try {
    const rateLimitResult = rateLimit(new Request('http://localhost'), 30, 60_000)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }
    const featuredProducts = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isPublished: true,
        creator: { isInternal: false },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        media: {
          where: { isThumbnail: true },
          take: 1,
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    })

    const productsWithRating = featuredProducts.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        contentRating: product.contentRating,
        rating: avgRating,
        reviewCount: product.reviews.length,
      }
    })

    return NextResponse.json({ products: productsWithRating }, { headers: getRateLimitHeaders(rateLimitResult) })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
}
