export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser, requireAuth } from "@/lib/session"
import { z } from "zod"

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFree: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  version: z.string().optional(),
  unityVersion: z.string().optional(),
  vrcSdkVersion: z.string().optional(),
  polygonCount: z.number().int().optional(),
  fileSize: z.number().int().optional(),
  questCompatible: z.boolean().default(false),
  pcCompatible: z.boolean().default(true),
  wholesaleEnabled: z.boolean().default(false),
  wholesaleMinQty: z.number().int().optional(),
  wholesalePrice: z.number().positive().optional(),
  licenseType: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "newest"
    const priceMin = searchParams.get("priceMin")
    const priceMax = searchParams.get("priceMax")
    const rating = searchParams.get("rating")
    const tags = searchParams.get("tags")
    const free = searchParams.get("free")
    const onSale = searchParams.get("onSale")
    const creator = searchParams.get("creator")

    const tagList = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : []

    const price: any = {}
    if (priceMin) price.gte = parseFloat(priceMin)
    if (priceMax) price.lte = parseFloat(priceMax)

    const where: any = {
      isPublished: true,
      ...(category && { category: { slug: category } }),
      ...(featured === "true" && { isFeatured: true }),
      ...(creator && { creator: { username: creator } }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(free === "true" && { isFree: true }),
      ...(onSale === "true" && { isOnSale: true }),
      ...(Object.keys(price).length > 0 && { price }),
      ...(tagList.length > 0 && {
        tags: {
          some: {
            tag: { slug: { in: tagList } },
          },
        },
      }),
    }


    if (rating) {
      const min = parseFloat(rating)
      const rated = await prisma.review.groupBy({
        by: ["productId"],
        _avg: { rating: true },
        having: { rating: { _avg: { gte: min } } },
      })
      where.id = { in: rated.map((r) => r.productId) }
    }

    const orderBy: any = {
      newest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
      "price-asc": { price: "asc" },
      "price-desc": { price: "desc" },
      popular: { favorites: { _count: "desc" } },
      "best-selling": { favorites: { _count: "desc" } },
      rating: { reviews: { _count: "desc" } },
    }[sort] || { createdAt: "desc" }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              store: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
          media: {
            where: { isThumbnail: true },
            take: 1,
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    const productsWithRating = products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        rating: avgRating,
        reviewCount: product.reviews.length,
      }
    })

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createProductSchema.parse(body)

    const store = await prisma.store.findUnique({
      where: { userId: user.id },
    })

    const slug = `${validated.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now()}`

    const { tags, ...productData } = validated

    const product = await prisma.product.create({
      data: {
        ...productData,
        creatorId: user.id,
        storeId: store?.id,
        slug,
      },
    })

    if (tags && tags.length > 0) {
      const tagRecords = await Promise.all(
        tags.map(async (tagName) => {
          const slug = tagName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
          return prisma.tag.upsert({
            where: { slug },
            update: {},
            create: {
              name: tagName,
              slug,
            },
          })
        })
      )

      await prisma.productTag.createMany({
        data: tagRecords.map((tag) => ({
          productId: product.id,
          tagId: tag.id,
        })),
      })
    }

    return NextResponse.json(
      await prisma.product.findUnique({
        where: { id: product.id },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          media: true,
        },
      }),
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Create product error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
