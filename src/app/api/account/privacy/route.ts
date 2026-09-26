export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const updateSchema = z.object({
  profileVisibility: z.enum(["public", "followers", "private"]).optional(),
  showEmail: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showWebsite: z.boolean().optional(),
  showBio: z.boolean().optional(),
  showPurchases: z.boolean().optional(),
  showReviews: z.boolean().optional(),
  showWishlist: z.boolean().optional(),
  allowDataCollection: z.boolean().optional(),
  allowPersonalization: z.boolean().optional(),
  allowMarketing: z.boolean().optional(),
})

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let settings = await prisma.privacySettings.findUnique({
      where: { userId: user.id },
    })

    if (!settings) {
      settings = await prisma.privacySettings.create({
        data: { userId: user.id },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Get privacy settings error:", error)
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

    const settings = await prisma.privacySettings.upsert({
      where: { userId: user.id },
      update: parsed.data,
      create: {
        userId: user.id,
        ...parsed.data,
      },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Update privacy settings error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}