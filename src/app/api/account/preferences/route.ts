export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({
        preferences: { showAdultContent: false, blurNsfwPreviews: true, signedIn: false },
      })
    }
    const prefs = await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    })
    return NextResponse.json({
      preferences: {
        showAdultContent: prefs.showAdultContent,
        blurNsfwPreviews: prefs.blurNsfwPreviews,
        adultConfirmedAt: prefs.adultConfirmedAt?.toISOString() ?? null,
        signedIn: true,
      },
    })
  } catch (error) {
    console.error("Get preferences error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
