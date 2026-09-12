export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { lastActive: "desc" },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        deviceName: true,
        lastActive: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Get sessions error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

const revokeSchema = z.object({
  sessionId: z.string(),
})

export async function DELETE(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = revokeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const session = await prisma.session.findUnique({
      where: { id: parsed.data.sessionId },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.session.delete({
      where: { id: parsed.data.sessionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Revoke session error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}