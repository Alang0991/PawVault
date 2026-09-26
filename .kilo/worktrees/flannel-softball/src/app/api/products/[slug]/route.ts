export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  isOnSale: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  version: z.string().optional(),
  unityVersion: z.string().optional(),
  vrcSdkVersion: z.string().optional(),
  polygonCount: z.number().int().optional(),
  fileSize: z.number().int().optional(),
  questCompatible: z.boolean().optional(),
  pcCompatible: z.boolean().optional(),
  wholesaleEnabled: z.boolean().optional(),
  wholesaleMinQty: z.number().int().optional(),
  wholesalePrice: z.number().positive().optional(),
  licenseType: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
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

    const baseWhere: any = {
      slug: params.slug,
    }

    if (!currentUser) {
      baseWhere.isPublished = true
      baseWhere.status = "PUBLISHED"
    } else {
      const product = await prisma.product.findUnique({
        where: { slug: params.slug },
        select: { creatorId: true, isPublished: true, status: true },
      })

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        )
      }

      const isOwner = product.creatorId === currentUser.id || ["ADMIN", "FOUNDER"].includes(currentUser.role)
      if (!isOwner && (!product.isPublished || product.status !== "PUBLISHED")) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        )
      }

      if (!isOwner) {
        baseWhere.isPublished = true
        baseWhere.status = "PUBLISHED"
      }
    }

    const product = await prisma.product.findUnique({
      where: baseWhere,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        category: true,
        media: {
          orderBy: { order: "asc" },
        },
        files: {
          select: {
            id: true,
            filename: true,
            size: true,
            platform: true,
            version: true,
          },
        },
        tags: {
          include: { tag: true },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ product }, { headers: getRateLimitHeaders(rateLimitResult) })
  } catch (error) {
    console.error("Get product error:", error)
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
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (product.creatorId !== user.id && !["ADMIN", "FOUNDER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateProductSchema.parse(body)

    const updated = await prisma.product.update({
      where: { slug: params.slug },
      data: validated,
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
        files: true,
      },
    })

    return NextResponse.json({ product: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Update product error:", error)
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
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (product.creatorId !== user.id && !["ADMIN", "FOUNDER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check for historical references that would be destroyed by hard delete
    const [orderItems, licenses, reviews, favorites] = await Promise.all([
      prisma.orderItem.count({ where: { productId: product.id } }),
      prisma.license.count({ where: { productId: product.id } }),
      prisma.review.count({ where: { productId: product.id } }),
      prisma.favorite.count({ where: { productId: product.id } }),
    ])

    const hasHistory = orderItems > 0 || licenses > 0 || reviews > 0 || favorites > 0

    if (hasHistory) {
      await prisma.product.update({
        where: { slug: params.slug },
        data: { status: "ARCHIVED", isPublished: false },
      })
    } else {
      await prisma.product.delete({
        where: { slug: params.slug },
      })
    }

    return NextResponse.json({ success: true, archived: hasHistory })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
