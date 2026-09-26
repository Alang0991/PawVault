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
    const trendingCreators = await prisma.user.findMany({
      where: {
        role: { in: ['CREATOR', 'VERIFIED_CREATOR'] },
        creatorStatus: 'APPROVED',
        status: 'ACTIVE',
        isInternal: false,
        store: {
          visibility: 'PUBLISHED',
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        salesCount: true,
        rating: true,
        isVerified: true,
        store: {
          select: {
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: [
        { salesCount: 'desc' },
        { rating: 'desc' },
      ],
      take: 4,
    })

    return NextResponse.json({ creators: trendingCreators }, { headers: getRateLimitHeaders(rateLimitResult) })
  } catch (error) {
    console.error('Error fetching trending creators:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending creators' },
      { status: 500 }
    )
  }
}
