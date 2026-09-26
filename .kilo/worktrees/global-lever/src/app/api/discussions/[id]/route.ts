export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const discussion = await prisma.discussion.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true } },
        product: { select: { id: true, title: true, slug: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
        },
        _count: { select: { likes: true } },
      },
    })

    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 })
    }

    return NextResponse.json({ discussion })
  } catch (error) {
    console.error("Get discussion error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

const createReplySchema = z.object({
  content: z.string().min(1),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createReplySchema.parse(body)

    const reply = await prisma.discussionReply.create({
      data: {
        discussionId: params.id,
        authorId: user.id,
        content: validated.content,
      },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    })

    return NextResponse.json({ reply }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Create reply error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
