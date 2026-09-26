export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const likeSchema = z.object({
  productId: z.string().min(1),
})

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = likeSchema.parse(body)

    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: validated.productId,
        },
      },
    })

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      })
      return NextResponse.json({ liked: false, totalLikes: await prisma.favorite.count({ where: { productId: validated.productId } }) })
    }

    await prisma.favorite.create({
      data: {
        userId: user.id,
        productId: validated.productId,
      },
    })

    return NextResponse.json({ liked: true, totalLikes: await prisma.favorite.count({ where: { productId: validated.productId } }) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Like product error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
