export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const trendingCreators = await prisma.user.findMany({
      where: {
        role: { in: ['CREATOR', 'VERIFIED_CREATOR'] },
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

    return NextResponse.json({ creators: trendingCreators })
  } catch (error) {
    console.error('Error fetching trending creators:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending creators' },
      { status: 500 }
    )
  }
}
