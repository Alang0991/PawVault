export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFree: z.boolean().optional(),
  isOnSale: z.boolean().optional(),
  isPublished: z.boolean().optional(),
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

async function getOwnedProduct(id: string, userId: string, role: string) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return null
  if (product.creatorId !== userId && role !== "ADMIN") return "forbidden" as const
  return product
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        media: { orderBy: { order: "asc" } },
        files: { orderBy: { createdAt: "asc" } },
        tags: { include: { tag: true } },
        creator: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const owned = await getOwnedProduct(params.id, user.id, user.role)
    if (!owned) return NextResponse.json({ error: "Product not found" }, { status: 404 })
    if (owned === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const validated = updateProductSchema.parse(body)

    const { tags, ...data } = validated

    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: params.id },
        data,
      })

      if (tags) {
        await tx.productTag.deleteMany({ where: { productId: params.id } })
        const tagRecords = await Promise.all(
          tags.map(async (name) => {
            const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
            return tx.tag.upsert({
              where: { slug },
              update: {},
              create: { name, slug },
            })
          }),
        )
        await tx.productTag.createMany({
          data: tagRecords.map((t) => ({ productId: params.id, tagId: t.id })),
        })
      }

      return product
    })

    await createAuditLog({
      userId: user.id,
      action: data.isPublished ? AuditActions.PRODUCT_PUBLISHED : AuditActions.PRODUCT_UPDATED,
      details: { productId: params.id },
    })

    return NextResponse.json({ product: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const owned = await getOwnedProduct(params.id, user.id, user.role)
    if (!owned) return NextResponse.json({ error: "Product not found" }, { status: 404 })
    if (owned === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await prisma.product.delete({ where: { id: params.id } })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.PRODUCT_DELETED,
      details: { productId: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
