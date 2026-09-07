import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

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

    const existing = await prisma.feedbackVote.findFirst({
      where: { postId: params.id, userId: user.id },
    })

    let voted = false
    let votes = post.votes

    if (existing) {
      await prisma.feedbackVote.delete({ where: { id: existing.id } })
      await prisma.feedbackPost.update({
        where: { id: params.id },
        data: { votes: { decrement: 1 } },
      })
      votes -= 1
      voted = false
    } else {
      await prisma.feedbackVote.create({
        data: { postId: params.id, userId: user.id },
      })
      await prisma.feedbackPost.update({
        where: { id: params.id },
        data: { votes: { increment: 1 } },
      })
      votes += 1
      voted = true
    }

    return NextResponse.json({ voted, votes })
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
