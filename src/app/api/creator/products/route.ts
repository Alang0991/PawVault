export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  salePrice: z.number().nonnegative().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFree: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  slug: z.string().optional(),
  unityVersion: z.string().optional(),
  vrcSdkVersion: z.string().optional(),
  contentRating: z.enum(["SFW", "MATURE", "NSFW"]).default("SFW"),
})

async function requireCreatorAccess(userId: string, userRole: string) {
  const fullUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { creatorStatus: true, role: true },
  })

  const creatorStatus = (fullUser as any)?.creatorStatus ?? "NONE"
  const isStaff = ["ADMIN", "FOUNDER", "MODERATOR"].includes(userRole)
  if (!["APPROVED"].includes(creatorStatus) && !isStaff) {
    return NextResponse.json({ error: "Creator account required" }, { status: 403 })
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const forbidden = await requireCreatorAccess(user.id, user.role)
    if (forbidden) return forbidden

    const body = await request.json()
    const validated = createProductSchema.parse(body)

    const store = await prisma.store.findUnique({
      where: { userId: user.id },
    })

    const baseSlug = (validated.slug?.trim() || validated.title)
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    let slug = baseSlug || `product-${Date.now()}`
    const clash = await prisma.product.findUnique({ where: { slug } })
    if (clash) slug = `${baseSlug}-${Date.now()}`

    const { tags, ...rest } = validated

    const product = await prisma.product.create({
      data: {
        creatorId: user.id,
        storeId: store?.id,
        title: rest.title,
        subtitle: rest.subtitle,
        description: rest.description,
        price: rest.isFree ? 0 : rest.price,
        salePrice: rest.salePrice,
        categoryId: rest.categoryId,
        isFree: rest.isFree,
        isOnSale: rest.isOnSale,
        isPublished: false,
        unityVersion: rest.unityVersion,
        vrcSdkVersion: rest.vrcSdkVersion,
        contentRating: rest.contentRating,
        slug,
        status: "DRAFT",
      },
    })

    if (tags && tags.length > 0) {
      const tagRecords = await Promise.all(
        tags.map(async (tagName) => {
          const tagSlug = tagName
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
          return prisma.tag.upsert({
            where: { slug: tagSlug || tagName.toLowerCase() },
            update: {},
            create: { name: tagName, slug: tagSlug || tagName.toLowerCase() },
          })
        })
      )
      await prisma.productTag.createMany({
        data: tagRecords.map((tag) => ({ productId: product.id, tagId: tag.id })),
      })
    }

    await createAuditLog({
      userId: user.id,
      action: AuditActions.PRODUCT_CREATED,
      details: { productId: product.id, title: product.title },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const forbidden = await requireCreatorAccess(user.id, user.role)
    if (forbidden) return forbidden

    const products = await prisma.product.findMany({
      where: { creatorId: user.id },
      include: {
        category: true,
        media: { orderBy: { order: "asc" } },
        files: { orderBy: { createdAt: "asc" } },
        tags: { include: { tag: true } },
        _count: {
          select: {
            reviews: true,
            wishlistItems: true,
            orderItems: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
