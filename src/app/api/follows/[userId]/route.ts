export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: params.userId,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Not following this user" }, { status: 404 })
    }

    await prisma.follower.delete({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: params.userId,
        },
      },
    })

    await prisma.user.update({
      where: { id: params.userId },
      data: { followersCount: { decrement: 1 } },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { followingCount: { decrement: 1 } },
    })

    return NextResponse.json({ success: true, following: false })
  } catch (error) {
    console.error("Unfollow error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
