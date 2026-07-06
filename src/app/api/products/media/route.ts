export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const createMediaSchema = z.object({
  productId: z.string(),
  url: z.string().url(),
  type: z.enum(["image", "video"]),
  order: z.number().int().default(0),
  isThumbnail: z.boolean().default(false),
})

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createMediaSchema.parse(body)

    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
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

    const media = await prisma.productMedia.create({
      data: {
        productId: validated.productId,
        url: validated.url,
        type: validated.type,
        order: validated.order,
        isThumbnail: validated.isThumbnail,
      },
    })

    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Upload media error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
