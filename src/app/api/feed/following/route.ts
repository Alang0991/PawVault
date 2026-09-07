export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Get followed creators
  const followed = await prisma.follower.findMany({
    where: { followerId: user.id },
    select: { followingId: true },
  })
  const followedIds = followed.map((f) => f.followingId)

  if (followedIds.length === 0) {
    return NextResponse.json({ items: [], total: 0, hasMore: false })
  }

  // Get latest products from followed creators
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        creatorId: { in: followedIds },
        isPublished: true,
      },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
        media: { where: { isThumbnail: true }, take: 1 },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.product.count({
      where: { creatorId: { in: followedIds }, isPublished: true },
    }),
  ])

  const enriched = items.map((p) => ({
    ...p,
    rating: p.reviews.length > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0,
    reviewCount: p.reviews.length,
  }))

  return NextResponse.json({
    items: enriched,
    total,
    hasMore: offset + items.length < total,
  })
}