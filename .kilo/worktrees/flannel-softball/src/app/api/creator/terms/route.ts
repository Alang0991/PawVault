export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const version = (body as any).version || "1.0"

    const existing = await prisma.creatorTerms.findUnique({
      where: { userId: user.id },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Creator terms already accepted." },
        { status: 409 }
      )
    }

    const terms = await prisma.creatorTerms.create({
      data: {
        userId: user.id,
        version,
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
      },
    })

    return NextResponse.json({ terms }, { status: 201 })
  } catch (error) {
    console.error("Accept creator terms error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const terms = await prisma.creatorTerms.findUnique({
      where: { userId: user.id },
    })

    return NextResponse.json({ terms })
  } catch (error) {
    console.error("Get creator terms error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
