export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCreatorAccess } from "@/lib/creator-access"
import { z } from "zod"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const createBundleSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().optional(),
  description: z.string().max(4000).optional(),
  coverImage: z.string().url().optional().nullable(),
  price: z.number().nonnegative(),
  productIds: z.array(z.string()).min(1).max(50),
  isPublished: z.boolean().default(false),
})

const updateBundleSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(4000).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  price: z.number().nonnegative().optional(),
  productIds: z.array(z.string()).min(1).max(50).optional(),
  isPublished: z.boolean().optional(),
})

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function getBundleWithItems(where: any) {
  return prisma.bundle.findUnique({
    where,
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
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          visibility: true,
        },
      },
      items: {
        orderBy: { order: "asc" },
        include: {
          product: {
            include: {
              media: { where: { isThumbnail: true }, take: 1 },
              creator: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  isVerified: true,
                },
              },
              reviews: { select: { rating: true } },
              _count: { select: { reviews: true, favorites: true } },
            },
          },
        },
      },
    },
  })
}

function enrichBundle(bundle: any) {
  if (!bundle) return null

  const totalValue = bundle.items.reduce(
    (sum: number, item: any) => {
      const p = item.product
      const effectivePrice = p.isOnSale && p.salePrice != null ? p.salePrice : p.price
      return sum + effectivePrice
    },
    0
  )
  const savings = Math.max(0, totalValue - bundle.price)

  return {
    ...bundle,
    totalValue,
    savings,
    savingsPercent: totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0,
    itemCount: bundle.items.length,
  }
}

export async function GET(request: Request) {
  try {
    const rateLimitResult = rateLimit(request, 30, 60_000)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")))
    const creator = searchParams.get("creator")
    const sort = searchParams.get("sort") || "newest"

    const where: any = {
      isPublished: true,
      creator: {
        creatorStatus: "APPROVED",
        status: "ACTIVE",
        isInternal: false,
        store: {
          visibility: "PUBLISHED",
        },
      },
      items: {
        some: {
          product: {
            isPublished: true,
            status: "PUBLISHED",
          },
        },
      },
    }
    if (creator) where.creator = { ...where.creator, username: creator }

    const orderBy: any = {
      newest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
      "price-asc": { price: "asc" },
      "price-desc": { price: "desc" },
      popular: { items: { _count: "desc" } },
    }[sort] || { createdAt: "desc" }

    const [bundles, total] = await Promise.all([
      prisma.bundle.findMany({
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
              isVerified: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              visibility: true,
            },
          },
          items: {
            orderBy: { order: "asc" },
            take: 6,
            include: {
              product: {
                include: {
                  media: { where: { isThumbnail: true }, take: 1 },
                  creator: {
                    select: {
                      id: true,
                      username: true,
                      displayName: true,
                      avatar: true,
                      isVerified: true,
                    },
                  },
                  reviews: { select: { rating: true } },
                  _count: { select: { reviews: true, favorites: true } },
                },
              },
            },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.bundle.count({ where }),
    ])

    return NextResponse.json(
      {
        bundles: bundles.map(enrichBundle),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    console.error("Get bundles error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const access = await getCreatorAccess()
    if (!access.allowed) {
      return NextResponse.json({ error: access.error, code: access.code }, { status: access.status })
    }

    const body = await request.json()
    const validated = createBundleSchema.parse(body)

    const store = await prisma.store.findUnique({
      where: { userId: access.userId },
    })
    if (!store) {
      return NextResponse.json({ error: "Create a store before making bundles" }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: validated.productIds },
        creatorId: access.userId,
      },
      select: { id: true, isPublished: true, status: true },
    })
    if (products.length !== validated.productIds.length) {
      return NextResponse.json(
        { error: "Every product in a bundle must belong to you" },
        { status: 400 }
      )
    }

    const baseSlug = slugify(validated.slug || validated.name)
    let slug = baseSlug || `bundle-${Date.now()}`
    const clash = await prisma.bundle.findUnique({ where: { slug } })
    if (clash) slug = `${baseSlug}-${Date.now()}`

    const bundle = await prisma.bundle.create({
      data: {
        creatorId: access.userId,
        storeId: store.id,
        name: validated.name,
        slug,
        description: validated.description,
        coverImage: validated.coverImage,
        price: validated.price,
        isPublished: validated.isPublished,
        items: {
          create: validated.productIds.map((productId, order) => ({
            productId,
            order,
          })),
        },
      },
      include: { items: { orderBy: { order: "asc" } } },
    })

    await createAuditLog({
      userId: access.userId,
      action: validated.isPublished ? AuditActions.BUNDLE_PUBLISHED : AuditActions.BUNDLE_CREATED,
      details: { bundleId: bundle.id, title: bundle.name },
      entityType: "Bundle",
      entityId: bundle.id,
    })

    return NextResponse.json(
      enrichBundle(await getBundleWithItems({ id: bundle.id })),
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create bundle error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
