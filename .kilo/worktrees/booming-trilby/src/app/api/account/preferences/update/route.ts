export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const updateSchema = z.object({
  showAdultContent: z.boolean().optional(),
  blurNsfwPreviews: z.boolean().optional(),
  confirm: z.boolean().optional(),
})

export async function PATCH(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "You must be signed in to update preferences." }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update payload." }, { status: 400 })
    }

    const current = await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    })

    const data: Record<string, unknown> = {}
    if (parsed.data.showAdultContent !== undefined) {
      if (parsed.data.showAdultContent && !current.showAdultContent) {
        if (!parsed.data.confirm) {
          return NextResponse.json(
            { error: "You must confirm you are 18 or older to enable adult content." },
            { status: 400 },
          )
        }
        data.showAdultContent = true
        data.adultConfirmedAt = new Date()
      } else {
        data.showAdultContent = parsed.data.showAdultContent
        if (!parsed.data.showAdultContent) {
          data.adultConfirmedAt = null
        }
      }
    }
    if (parsed.data.blurNsfwPreviews !== undefined) {
      data.blurNsfwPreviews = parsed.data.blurNsfwPreviews
    }

    const updated = await prisma.userPreference.update({
      where: { userId: user.id },
      data,
    })

    return NextResponse.json({
      preferences: {
        showAdultContent: updated.showAdultContent,
        blurNsfwPreviews: updated.blurNsfwPreviews,
        adultConfirmedAt: updated.adultConfirmedAt?.toISOString() ?? null,
      },
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
