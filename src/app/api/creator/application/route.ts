export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const creatorApplicationSchema = z.object({
  displayName: z.string().min(1).max(100),
  bio: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  socialLinks: z.record(z.string()).optional(),
})

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const application = await prisma.creatorApplication.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error("Get creator application error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = creatorApplicationSchema.parse(body)

    const existing = await prisma.creatorApplication.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ["PENDING", "UNDER_REVIEW", "APPROVED"],
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "You already have an active creator application." },
        { status: 409 }
      )
    }

    const application = await prisma.creatorApplication.create({
      data: {
        userId: user.id,
        displayName: validated.displayName,
        bio: validated.bio,
        website: validated.website,
        socialLinks: validated.socialLinks ? JSON.stringify(validated.socialLinks) : undefined,
        status: "PENDING",
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.CREATOR_APPLICATION_SUBMITTED,
      details: { applicationId: application.id },
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create creator application error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
