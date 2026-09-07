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
        _count: { select: { comments: true, votes_rel: true } },
      },
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
      post: {
        ...post,
        commentCount: post._count.comments,
        voteCount: post._count.votes_rel,
      },
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get feedback error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminOrFounder()

    const body = await request.json()
    const validated = z.object({ action: z.string() }).parse(body)

    const post = await prisma.feedbackPost.findUnique({
      where: { id: params.id },
    })
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await prisma.feedbackPost.update({
      where: { id: params.id },
      data: {
        status: validated.action.toUpperCase(),
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
        _count: { select: { comments: true, votes_rel: true } },
      },
    })

    await createAuditLog({
      action: AuditActions.ADMIN_MODERATION_ACTION,
      details: { action: validated.action, feedbackId: post.id },
      entityType: "FeedbackPost",
      entityId: post.id,
    })

    return NextResponse.json({
      ...updated,
      commentCount: updated._count.comments,
      voteCount: updated._count.votes_rel,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Update feedback error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminOrFounder()

    const post = await prisma.feedbackPost.findUnique({
      where: { id: params.id },
    })
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.feedbackPost.delete({ where: { id: params.id } })

    await createAuditLog({
      action: AuditActions.ADMIN_MODERATION_ACTION,
      details: { action: "delete", feedbackId: post.id },
      entityType: "FeedbackPost",
      entityId: post.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete feedback error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
