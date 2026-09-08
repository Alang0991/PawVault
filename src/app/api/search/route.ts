export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { z } from 'zod'

const querySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.string().optional(),
  type: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const rateLimitResult = rateLimit(request, 60, 60_000)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }
    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse({
      q: searchParams.get('q') || '',
      limit: searchParams.get('limit') || undefined,
      type: searchParams.get('type') || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
    }

    const query = parsed.data.q.trim()
    const limit = Math.min(50, parseInt(parsed.data.limit || '10'))
    const type = parsed.data.type || 'all'

    const results: { products: any[]; creators: any[]; categories: any[]; tags: any[]; total: number } = {
      products: [],
      creators: [],
      categories: [],
      tags: [],
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
            select: { id: true, username: true, displayName: true, avatar: true },
          },
          media: { where: { isThumbnail: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: true } },
          reviews: { select: { rating: true } },
          _count: { select: { favorites: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      results.products = products.map((p) => ({
        ...p,
        rating: p.reviews.length > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0,
        reviewCount: p.reviews.length,
      }))
      results.total += results.products.length
    }

    // Search creators
    if (type === 'all' || type === 'creators') {
      const creators = await prisma.user.findMany({
        where: {
          role: { in: ['CREATOR', 'VERIFIED_CREATOR'] },
          creatorStatus: 'APPROVED',
          status: 'ACTIVE',
          store: {
            visibility: 'PUBLISHED',
          },
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
          store: { select: { name: true, slug: true } },
        },
        orderBy: { salesCount: 'desc' },
        take: limit,
      })
      results.creators = creators
      results.total += creators.length
    }

    // Search categories
    if (type === 'all' || type === 'categories') {
      const categories = await prisma.category.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        include: { _count: { select: { products: { where: { isPublished: true } } } } },
        take: limit,
      })
      results.categories = categories
      results.total += categories.length
    }

    // Search tags
    if (type === 'all' || type === 'tags') {
      const tags = await prisma.tag.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        include: { _count: { select: { products: true } } },
        take: limit,
      })
      results.tags = tags
      results.total += tags.length
    }

    return NextResponse.json(results, { headers: getRateLimitHeaders(rateLimitResult) })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}