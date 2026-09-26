export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  isPublished: z.boolean().default(true),
})

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user || !["CREATOR", "ADMIN", "FOUNDER"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const announcements = await prisma.announcement.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error("Get creator announcements error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user || !["CREATOR", "ADMIN", "FOUNDER"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createAnnouncementSchema.parse(body)

    const announcement = await prisma.announcement.create({
      data: {
        title: validated.title,
        body: validated.content,
        isPublished: validated.isPublished,
        authorId: user.id,
        publishedAt: validated.isPublished ? new Date() : undefined,
      },
    })

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Create announcement error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
