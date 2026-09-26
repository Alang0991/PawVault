export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  image: z.string().url().optional().nullable(),
  contentRating: z.enum(["SFW", "MATURE", "NSFW"]).default("SFW"),
  productId: z.string().optional().nullable(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get("userId")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const currentUser = await getServerUser()

    let targetUserId: string | null = null
    let requestedStatus: string | null = null

    if (requestedUserId) {
      // Only allow querying your own posts with non-PUBLISHED status.
      // Public access (no auth) can only see PUBLISHED posts.
      if (currentUser && requestedUserId === currentUser.id) {
        targetUserId = requestedUserId
        if (status) {
          requestedStatus = status
        }
      } else {
        // For other users or unauthenticated, only show published posts
        targetUserId = requestedUserId
        if (status && status !== "PUBLISHED") {
          return NextResponse.json(
            { error: "Cannot query non-published posts of other users" },
            { status: 403 },
          )
        }
      }
    } else {
      // No userId provided — require auth and default to own posts
      if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      targetUserId = currentUser.id
      if (status) {
        requestedStatus = status
      }
    }

    const where: any = {
      userId: targetUserId,
      ...(requestedStatus ? { status: requestedStatus } : { status: "PUBLISHED" }),
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        total,
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createPostSchema.parse(body)

    const existing = await prisma.post.findFirst({
      where: { userId: user.id, slug: validated.slug },
    })

    if (existing) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 })
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

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        title: validated.title,
        slug: validated.slug,
        content: validated.content,
        excerpt: validated.excerpt,
        status: validated.status,
        image: validated.image,
        contentRating: validated.contentRating,
        productId: validated.productId,
        publishedAt: validated.status === "PUBLISHED" ? new Date() : null,
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
          },
        },
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
