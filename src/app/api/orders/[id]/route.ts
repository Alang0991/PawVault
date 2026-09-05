export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { id: true, username: true, displayName: true } },
      items: {
        include: {
          product: {
            include: {
              media: { where: { isThumbnail: true }, take: 1 },
              creator: { select: { id: true, username: true, displayName: true } },
            },
          },
        },
      },
      payments: true,
      refunds: true,
      disputes: true,
      licenses: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (order.buyerId !== user.id) {
    const isCreator = order.creatorId === user.id
    if (!isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  return NextResponse.json({ order })
}