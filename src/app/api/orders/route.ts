export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerUser } from "@/lib/session"

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const licenses = await prisma.order.findMany({
      where: { buyerId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                media: {
                  where: { isThumbnail: true },
                  take: 1,
                },
              },
            },
          },
        },
        payments: true,
        licenses: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ licenses })
  } catch (error) {
    console.error("Get licenses error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
