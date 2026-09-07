export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { z } from "zod"

const createAppealSchema = z.object({
  type: z.string().min(1).max(50),
  reason: z.string().min(1).max(2000),
  evidence: z.string().optional(),
})

export async function GET() {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appeals = await prisma.appeal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ appeals })
  } catch (error) {
    console.error("Get appeals error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createAppealSchema.parse(body)

    const appeal = await prisma.appeal.create({
      data: {
        userId: user.id,
        type: validated.type,
        reason: validated.reason,
        evidence: validated.evidence,
      },
    })

    return NextResponse.json({ appeal }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create appeal error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
