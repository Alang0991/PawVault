export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCreatorAccess } from "@/lib/creator-access"

export async function GET() {
  const access = await getCreatorAccess()
  if (!access.allowed) {
    return NextResponse.json({ error: access.error, code: access.code }, { status: access.status })
  }

  const orders = await prisma.order.findMany({
    where: { creatorId: access.userId },
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