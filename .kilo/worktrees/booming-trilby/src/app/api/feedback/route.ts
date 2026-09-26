import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { z } from "zod"

const createFeedbackSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(5000),
  category: z.enum([
    "Feature Request",
    "Bug Report",
    "Improvement",
    "Creator Request",
    "Marketplace Request",
    "API / Developer",
    "Other",
  ]),
})

const moderateSchema = z.object({
  action: z.enum(["pin", "unpin", "lock", "unlock", "status", "duplicate"]),
  status: z
    .enum([
      "OPEN",
      "UNDER_REVIEW",
      "PLANNED",
      "IN_PROGRESS",
      "COMPLETED",
      "DECLINED",
      "DUPLICATE",
    ])
    .optional(),
  duplicateOf: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const q = searchParams.get("q")

    const where: any = {}
    if (category) where.category = category
    if (status) where.status = status
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.feedbackPost.findMany({
        where,
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
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.feedbackPost.count({ where }),
    ])

    return NextResponse.json({
      posts: posts.map((p) => ({
        ...p,
        commentCount: p._count.comments,
        voteCount: p._count.votes_rel,
      })),
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

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createFeedbackSchema.parse(body)

    const post = await prisma.feedbackPost.create({
      data: {
        userId: user.id,
        title: validated.title,
        content: validated.content,
        category: validated.category,
        status: "OPEN",
        votes: 0,
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
      userId: user.id,
      action: AuditActions.PRODUCT_CREATED,
      details: { type: "feedback", feedbackId: post.id, title: post.title },
      entityType: "FeedbackPost",
      entityId: post.id,
    })

    return NextResponse.json(
      {
        ...post,
        commentCount: post._count.comments,
        voteCount: post._count.votes_rel,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create feedback error:", error)
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
    const validated = moderateSchema.parse(body)

    const post = await prisma.feedbackPost.findUnique({
      where: { id: params.id },
    })
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const data: any = {}
    switch (validated.action) {
      case "pin":
        data.isPinned = true
        break
      case "unpin":
        data.isPinned = false
        break
      case "lock":
        data.isLocked = true
        break
      case "unlock":
        data.isLocked = false
        break
      case "status":
        if (!validated.status) {
          return NextResponse.json({ error: "Status required" }, { status: 400 })
        }
        data.status = validated.status
        break
      case "duplicate":
        if (!validated.duplicateOf) {
          return NextResponse.json({ error: "duplicateOf required" }, { status: 400 })
        }
        data.duplicateOf = validated.duplicateOf
        data.status = "DUPLICATE"
        break
    }

    const updated = await prisma.feedbackPost.update({
      where: { id: params.id },
      data,
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
    console.error("Moderate feedback error:", error)
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
