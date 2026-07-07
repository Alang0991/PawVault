export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification || notification.userId !== user.id) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Mark notification read error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
