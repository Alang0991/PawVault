export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(2000).optional(),
  coverImage: z.string().url().optional(),
  isPublic: z.boolean().default(true),
})

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens").optional(),
  description: z.string().max(2000).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
})

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ collections })
  } catch (error) {
    console.error("Get collections error:", error)
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
    const validated = createCollectionSchema.parse(body)

    const existing = await prisma.collection.findFirst({
      where: { userId: user.id, slug: validated.slug },
    })

    if (existing) {
      return NextResponse.json({ error: "A collection with this slug already exists" }, { status: 409 })
    }

    const collection = await prisma.collection.create({
      data: {
        userId: user.id,
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        coverImage: validated.coverImage,
        isPublic: validated.isPublic,
      },
    })

    return NextResponse.json({ collection }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Create collection error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
