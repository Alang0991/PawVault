export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query) {
      return NextResponse.json({ products: [], creators: [], total: 0 })
    }

    const results: { products: any[]; creators: any[]; total: number } = {
      products: [],
      creators: [],
      total: 0,
    }

    // Search products
    if (type === 'all' || type === 'products') {
      const products = await prisma.product.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { subtitle: { contains: query, mode: 'insensitive' } },
          ],
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
        take: limit,
        skip: offset,
      })
      results.products = products
      results.total += products.length
    }

    // Search creators
    if (type === 'all' || type === 'creators') {
      const creators = await prisma.user.findMany({
        where: {
          role: { in: ['CREATOR', 'VERIFIED_CREATOR'] },
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } },
          ],
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
        orderBy: { salesCount: 'desc' },
        take: limit,
        skip: offset,
      })
      results.creators = creators
      results.total += creators.length
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
