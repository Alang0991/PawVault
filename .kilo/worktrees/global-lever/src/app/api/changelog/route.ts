import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(3).max(200),
  summary: z.string().max(500).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  category: z.enum([
    "New",
    "Improved",
    "Fixed",
    "Creator",
    "Marketplace",
    "Platform",
    "API",
  ]),
  releaseDate: z.string().datetime(),
  feedbackId: z.string().optional().nullable(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = {}
    if (category) where.category = category

    const [entries, total] = await Promise.all([
      prisma.changelogEntry.findMany({
        where,
        orderBy: { releaseDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.changelogEntry.count({ where }),
    ])

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get changelog error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrFounder()

    const body = await request.json()
    const validated = createSchema.parse(body)

    const user = await getServerUser()

    const entry = await prisma.changelogEntry.create({
      data: {
        title: validated.title,
        summary: validated.summary,
        description: validated.description,
        category: validated.category,
        releaseDate: new Date(validated.releaseDate),
        feedbackId: validated.feedbackId,
        authorId: user?.id,
      },
    })

    await createAuditLog({
      action: AuditActions.ANNOUNCEMENT_CREATED,
      details: { type: "changelog", entryId: entry.id, title: entry.title },
      entityType: "ChangelogEntry",
      entityId: entry.id,
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create changelog error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
