export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'products'

  if (type === 'products') {
    const [total, newToday, freeCount, onSaleCount] = await Promise.all([
      prisma.product.count({ where: { isPublished: true, creator: { isInternal: false } } }),
      prisma.product.count({
        where: { isPublished: true, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, creator: { isInternal: false } },
      }),
      prisma.product.count({ where: { isPublished: true, isFree: true, creator: { isInternal: false } } }),
      prisma.product.count({ where: { isPublished: true, isOnSale: true, creator: { isInternal: false } } }),
    ])

    return NextResponse.json({ total, newToday, freeCount, onSaleCount })
  }

  if (type === 'creators') {
    const [total, newToday] = await Promise.all([
      prisma.user.count({ where: { role: { in: ['CREATOR', 'VERIFIED_CREATOR'] }, isInternal: false } }),
      prisma.user.count({
        where: {
          role: { in: ['CREATOR', 'VERIFIED_CREATOR'] },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          isInternal: false,
        },
      }),
    ])

    return NextResponse.json({ total, newToday })
  }

  if (type === 'categories') {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isPublished: true,
                status: 'PUBLISHED',
                creator: {
                  creatorStatus: 'APPROVED',
                  status: 'ACTIVE',
                  isInternal: false,
                },
                store: {
                  visibility: 'PUBLISHED',
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
      take: 8,
    })
    return NextResponse.json({ categories })
  }

  if (type === 'tags') {
    const tags = await prisma.tag.findMany({
      where: {
        products: {
          some: {
            product: {
              isPublished: true,
              status: 'PUBLISHED',
              creator: { isInternal: false },
            },
          },
        },
      },
      include: { _count: { select: { products: true } } },
      orderBy: { products: { _count: 'desc' } },
      take: 15,
    })
    return NextResponse.json({ tags })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}