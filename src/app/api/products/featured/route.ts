export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isPublished: true,
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
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    })

    return NextResponse.json({ products: featuredProducts })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
}
