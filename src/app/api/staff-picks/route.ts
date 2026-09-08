export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  let picks: any[] = []
  try {
    picks = await prisma.staffPick.findMany({
      where: { isActive: true },
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
        staff: { select: { id: true, username: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    })
  } catch (error) {
    console.error("Staff picks API error:", error)
    return NextResponse.json({ picks: [] })
  }

  const enriched = picks.map((p) => {
    const avgRating =
      p.product.reviews.length > 0
        ? p.product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / p.product.reviews.length
        : 0
    return {
      id: p.id,
      note: p.note,
      createdAt: p.createdAt,
      product: {
        ...p.product,
        rating: avgRating,
        reviewCount: p.product.reviews.length,
      },
      staff: p.staff,
    }
  })

  return NextResponse.json({ picks: enriched })
}