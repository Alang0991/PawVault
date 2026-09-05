export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { creatorId: user.id },
    include: {
      buyer: { select: { id: true, username: true, displayName: true } },
      items: {
        include: {
          product: {
            include: {
              media: { where: { isThumbnail: true }, take: 1 },
            },
          },
        },
      },
      payments: true,
      licenses: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ orders })
}