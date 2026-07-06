export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const updateProductTagsSchema = z.object({
  tagIds: z.array(z.string()),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (product.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const productTags = await prisma.productTag.findMany({
      where: { productId: params.id },
      include: { tag: true },
    })

    return NextResponse.json({ 
      tags: productTags.map(pt => pt.tag)
    })
  } catch (error) {
    console.error("Get product tags error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (product.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateProductTagsSchema.parse(body)

    await prisma.productTag.deleteMany({
      where: { productId: params.id },
    })

    if (validated.tagIds.length > 0) {
      await prisma.productTag.createMany({
        data: validated.tagIds.map((tagId) => ({
          productId: params.id,
          tagId,
        })),
      })
    }

    const productTags = await prisma.productTag.findMany({
      where: { productId: params.id },
      include: { tag: true },
    })

    return NextResponse.json({ 
      tags: productTags.map(pt => pt.tag)
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Update product tags error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
