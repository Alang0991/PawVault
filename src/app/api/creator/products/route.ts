export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["CREATOR", "VERIFIED_CREATOR", "ADMIN", "OWNER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

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
        isPublished: rest.isPublished,
        unityVersion: rest.unityVersion,
        vrcSdkVersion: rest.vrcSdkVersion,
        contentRating: rest.contentRating,
        slug,
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
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: { creatorId: user.id },
      include: {
        _count: {
          select: {
            reviews: true,
            wishlistItems: true,
            orderItems: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
