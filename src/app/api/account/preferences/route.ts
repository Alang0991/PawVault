export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const updateSchema = z.object({
  security: z.boolean().optional(),
  account: z.boolean().optional(),
  orders: z.boolean().optional(),
  refunds: z.boolean().optional(),
  support: z.boolean().optional(),
  moderation: z.boolean().optional(),
  productUpdates: z.boolean().optional(),
  followedCreators: z.boolean().optional(),
  marketing: z.boolean().optional(),
  wishlistSale: z.boolean().optional(),
  wishlistPriceChange: z.boolean().optional(),
  wishlistAvailable: z.boolean().optional(),
  creatorAnnouncements: z.boolean().optional(),
  newProductFollowed: z.boolean().optional(),
  reviewNotifications: z.boolean().optional(),
  paymentNotifications: z.boolean().optional(),
  payoutNotifications: z.boolean().optional(),
  securityNotifications: z.boolean().optional(),
  systemAnnouncements: z.boolean().optional(),
  creatorApproval: z.boolean().optional(),
})

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let prefs = await prisma.emailPreference.findUnique({
      where: { userId: user.id },
    })

    if (!prefs) {
      prefs = await prisma.emailPreference.create({
        data: { userId: user.id },
      })
    }

    return NextResponse.json({ preferences: prefs })
  } catch (error) {
    console.error("Get email preferences error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const prefs = await prisma.emailPreference.upsert({
      where: { userId: user.id },
      update: parsed.data,
      create: {
        userId: user.id,
        ...parsed.data,
      },
    })

    return NextResponse.json({ preferences: prefs })
  } catch (error) {
    console.error("Update email preferences error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}