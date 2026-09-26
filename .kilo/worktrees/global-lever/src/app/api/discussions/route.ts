export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const discussions = await prisma.discussion.findMany({
      where: { productId },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
        },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ discussions })
  } catch (error) {
    console.error("Get discussions error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

const createDiscussionSchema = z.object({
  productId: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createDiscussionSchema.parse(body)

    const discussion = await prisma.discussion.create({
      data: {
        productId: validated.productId,
        title: validated.title,
        content: validated.content,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    })

    return NextResponse.json({ discussion }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Create discussion error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
