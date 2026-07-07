export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().optional(),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  unityVersion: z.string().optional(),
  vrcSdkVersion: z.string().optional(),
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

    const baseSlug = validated.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    let slug = baseSlug || `product-${Date.now()}`
    const clash = await prisma.product.findUnique({ where: { slug } })
    if (clash) slug = `${baseSlug}-${Date.now()}`

    const product = await prisma.product.create({
      data: {
        creatorId: user.id,
        storeId: store?.id,
        title: validated.title,
        subtitle: validated.subtitle,
        description: validated.description,
        price: validated.isFree ? 0 : validated.price,
        categoryId: validated.categoryId,
        isFree: validated.isFree,
        isPublished: validated.isPublished,
        unityVersion: validated.unityVersion,
        vrcSdkVersion: validated.vrcSdkVersion,
        slug,
      },
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
