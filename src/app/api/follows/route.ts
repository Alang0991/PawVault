export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body as { userId: string }

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    if (userId === user.id) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, displayName: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existing = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Already following this user" }, { status: 409 })
    }

    await prisma.follower.create({
      data: {
        followerId: user.id,
        followingId: userId,
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { followersCount: { increment: 1 } },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { followingCount: { increment: 1 } },
    })

    return NextResponse.json({ success: true, following: true }, { status: 201 })
  } catch (error) {
    console.error("Follow error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const checkUserId = searchParams.get("userId")

    if (checkUserId) {
      if (checkUserId === user.id) {
        return NextResponse.json({ following: false, self: true })
      }

      const follow = await prisma.follower.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: checkUserId,
          },
        },
      })

      return NextResponse.json({ following: !!follow })
    }

    const following = await prisma.follower.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            followersCount: true,
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      following: following.map((f) => f.following),
    })
  } catch (error) {
    console.error("Get following error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
