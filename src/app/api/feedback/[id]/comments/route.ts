import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { z } from "zod"

const commentSchema = z.object({
  content: z.string().min(2).max(2000),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const post = await prisma.feedbackPost.findUnique({
      where: { id: params.id },
    })
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const [comments, total] = await Promise.all([
      prisma.feedbackComment.findMany({
        where: { postId: params.id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.feedbackComment.count({ where: { postId: params.id } }),
    ])

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
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

    const post = await prisma.feedbackPost.findUnique({
      where: { id: params.id },
    })
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (post.isLocked) {
      return NextResponse.json({ error: "Comments are locked" }, { status: 403 })
    }

    const body = await request.json()
    const validated = commentSchema.parse(body)

    const isStaff = ["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)

    const comment = await prisma.feedbackComment.create({
      data: {
        postId: params.id,
        userId: user.id,
        content: validated.content,
        isOfficial: isStaff,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.PRODUCT_CREATED,
      details: { type: "feedback-comment", feedbackId: params.id, commentId: comment.id },
      entityType: "FeedbackComment",
      entityId: comment.id,
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create comment error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
