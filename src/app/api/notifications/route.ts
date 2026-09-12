export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    })

    const productNotifications = await prisma.productNotification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      include: {
        product: {
          include: {
            creator: { select: { username: true, displayName: true } },
            media: { take: 1, where: { type: "image" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({
      notifications,
      unreadCount,
      productNotifications: productNotifications.map((n) => ({
        id: n.id,
        productId: n.product.id,
        title: n.product.title,
        slug: n.product.slug,
        creator: n.product.creator,
        imageUrl: n.product.media[0]?.url ?? null,
        type: n.type,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
