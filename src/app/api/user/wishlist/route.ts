export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const getQuerySchema = z.object({
  sort: z.enum(["newest", "oldest", "price-asc", "price-desc", "name-asc", "name-desc"]).optional(),
  filter: z.enum(["all", "on-sale", "free", "owned"]).optional(),
  category: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parsed = getQuerySchema.safeParse({
      sort: searchParams.get("sort") || undefined,
      filter: searchParams.get("filter") || undefined,
      category: searchParams.get("category") || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }

    const { sort, filter, category } = parsed.data

    const where: any = { userId: user.id }

    // We need to filter based on product properties, so we'll fetch and filter
    const wishlist = await prisma.wishlistItem.findMany({
      where,
      include: {
        product: {
          include: {
            media: {
              where: { isThumbnail: true },
              take: 1,
            },
            creator: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
            category: { select: { id: true, name: true, slug: true } },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Apply product-level filters
    let items = wishlist
      .filter((item) => item.product && item.product.isPublished)
      .map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        product: {
          ...item.product,
          reviewCount: item.product._count.reviews,
        },
      }))

    if (filter === "on-sale") {
      items = items.filter((i) => i.product.isOnSale && i.product.salePrice != null && i.product.salePrice < i.product.price)
    } else if (filter === "free") {
      items = items.filter((i) => i.product.isFree)
    } else if (filter === "owned") {
      // This would require checking licenses - skip for now
    }

    if (category) {
      items = items.filter((i) => i.product.category?.slug === category)
    }

    // Apply sorting
    const sortMap: Record<string, (a: any, b: any) => number> = {
      newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      oldest: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      "price-asc": (a, b) => {
        const priceA = a.product.isOnSale && a.product.salePrice ? a.product.salePrice : a.product.price
        const priceB = b.product.isOnSale && b.product.salePrice ? b.product.salePrice : b.product.price
        return priceA - priceB
      },
      "price-desc": (a, b) => {
        const priceA = a.product.isOnSale && a.product.salePrice ? a.product.salePrice : a.product.price
        const priceB = b.product.isOnSale && b.product.salePrice ? b.product.salePrice : b.product.price
        return priceB - priceA
      },
      "name-asc": (a, b) => a.product.title.localeCompare(b.product.title),
      "name-desc": (a, b) => b.product.title.localeCompare(a.product.title),
    }

    if (sort && sortMap[sort]) {
      items.sort(sortMap[sort])
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Get wishlist error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()

    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        productId,
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
