export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { getCreatorAccess } from "@/lib/creator-access"
import { z } from "zod"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

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

async function resolveBundle(slug: string, currentUser: any) {
  const bundle = await getBundleWithItems({ slug })
  if (!bundle) return null

  const isOwner =
    currentUser &&
    (bundle.creatorId === currentUser.id ||
      ["ADMIN", "FOUNDER"].includes(currentUser.role))

  if (!bundle.isPublished && !isOwner) return null

  return bundle
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const rateLimitResult = rateLimit(request, 30, 60_000)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const currentUser = await getServerUser()
    const bundle = await resolveBundle(params.slug, currentUser)
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    return NextResponse.json(
      { bundle: enrichBundle(bundle) },
      { headers: getRateLimitHeaders(rateLimitResult) }
    )
  } catch (error) {
    console.error("Get bundle error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const access = await getCreatorAccess()
    if (!access.allowed) {
      return NextResponse.json({ error: access.error, code: access.code }, { status: access.status })
    }

    const bundle = await getBundleWithItems({ slug: params.slug })
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }
    if (bundle.creatorId !== access.userId && !["ADMIN", "FOUNDER"].includes(access.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateBundleSchema.parse(body)
    const data: any = {}

    if (validated.name !== undefined) data.name = validated.name
    if (validated.description !== undefined) data.description = validated.description
    if (validated.coverImage !== undefined) data.coverImage = validated.coverImage
    if (validated.price !== undefined) data.price = validated.price
    if (validated.isPublished !== undefined) data.isPublished = validated.isPublished

    if (validated.productIds) {
      const products = await prisma.product.findMany({
        where: {
          id: { in: validated.productIds },
          creatorId: access.userId,
        },
        select: { id: true },
      })
      if (products.length !== validated.productIds.length) {
        return NextResponse.json(
          { error: "Every product in a bundle must belong to you" },
          { status: 400 }
        )
      }
      await prisma.bundleItem.deleteMany({ where: { bundleId: bundle.id } })
      data.items = {
        create: validated.productIds.map((productId, order) => ({ productId, order }))
      }
    }

    const updated = await prisma.bundle.update({
      where: { slug: params.slug },
      data,
    })

    await createAuditLog({
      userId: access.userId,
      action: validated.isPublished === true
        ? AuditActions.BUNDLE_PUBLISHED
        : validated.isPublished === false
          ? AuditActions.BUNDLE_UNPUBLISHED
          : AuditActions.BUNDLE_UPDATED,
      details: { bundleId: updated.id, title: updated.name },
      entityType: "Bundle",
      entityId: updated.id,
    })

    return NextResponse.json({ bundle: enrichBundle(await getBundleWithItems({ id: updated.id })) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Update bundle error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const access = await getCreatorAccess()
    if (!access.allowed) {
      return NextResponse.json({ error: access.error, code: access.code }, { status: access.status })
    }

    const bundle = await prisma.bundle.findUnique({
      where: { slug: params.slug },
      include: {
        items: true,
        cartItems: true,
      },
    })
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }
    if (bundle.creatorId !== access.userId && !["ADMIN", "FOUNDER"].includes(access.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const hasHistory = bundle.cartItems.length > 0
    if (hasHistory) {
      await prisma.bundle.update({
        where: { slug: params.slug },
        data: { isPublished: false },
      })
    } else {
      await prisma.bundle.delete({ where: { slug: params.slug } })
    }

    await createAuditLog({
      userId: access.userId,
      action: AuditActions.BUNDLE_DELETED,
      details: { bundleId: bundle.id, title: bundle.name },
      entityType: "Bundle",
      entityId: bundle.id,
    })

    return NextResponse.json({ success: true, archived: hasHistory })
  } catch (error) {
    console.error("Delete bundle error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
