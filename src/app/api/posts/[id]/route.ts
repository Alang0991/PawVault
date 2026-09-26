export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens").optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  image: z.string().url().optional().nullable(),
  contentRating: z.enum(["SFW", "MATURE", "NSFW"]).optional(),
  productId: z.string().optional().nullable(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    const post = await prisma.post.findFirst({
      where: {
        id: params.id,
        ...(currentUser ? {} : { status: "PUBLISHED" }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            isPublished: true,
            media: {
              where: { isThumbnail: true },
              take: 1,
            },
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const isAuthor = currentUser?.id === post.userId
    if (!isAuthor && post.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ post }, { headers: getRateLimitHeaders(rateLimitResult) })
  } catch (error) {
    console.error("Get post error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await prisma.post.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const body = await request.json()
    const validated = updatePostSchema.parse(body)

    if (validated.slug && validated.slug !== post.slug) {
      const existing = await prisma.post.findFirst({
        where: { userId: user.id, slug: validated.slug },
      })

      if (existing) {
        return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 })
      }
    }

    if (validated.productId) {
      const product = await prisma.product.findUnique({
        where: { id: validated.productId },
        select: { id: true, creatorId: true, isPublished: true },
      })

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      if (product.creatorId !== user.id) {
        return NextResponse.json({ error: "You can only reference your own products" }, { status: 403 })
      }
    }

    const updateData: any = {}
    if (validated.title) updateData.title = validated.title
    if (validated.slug) updateData.slug = validated.slug
    if (validated.content) updateData.content = validated.content
    if (validated.excerpt !== undefined) updateData.excerpt = validated.excerpt
    if (validated.status) {
      updateData.status = validated.status
      if (validated.status === "PUBLISHED" && post.status !== "PUBLISHED") {
        updateData.publishedAt = new Date()
      }
    }
    if (validated.image !== undefined) updateData.image = validated.image
    if (validated.contentRating) updateData.contentRating = validated.contentRating
    if (validated.productId !== undefined) updateData.productId = validated.productId

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            isPublished: true,
          },
        },
      },
    })

    return NextResponse.json({ post: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Update post error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await prisma.post.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    await prisma.post.delete({
      where: { id: post.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete post error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
