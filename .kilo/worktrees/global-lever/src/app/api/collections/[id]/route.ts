export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens").optional(),
  description: z.string().max(2000).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const collection = await prisma.collection.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            product: {
              include: {
                creator: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                  },
                },
                media: {
                  where: { isThumbnail: true },
                  take: 1,
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    return NextResponse.json({ collection })
  } catch (error) {
    console.error("Get collection error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const collection = await prisma.collection.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const body = await request.json()
    const validated = updateCollectionSchema.parse(body)

    if (validated.slug && validated.slug !== collection.slug) {
      const existing = await prisma.collection.findFirst({
        where: { userId: user.id, slug: validated.slug },
      })

      if (existing) {
        return NextResponse.json({ error: "A collection with this slug already exists" }, { status: 409 })
      }
    }

    const updated = await prisma.collection.update({
      where: { id: collection.id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.slug && { slug: validated.slug }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.coverImage !== undefined && { coverImage: validated.coverImage }),
        ...(validated.isPublic !== undefined && { isPublic: validated.isPublic }),
      },
    })

    return NextResponse.json({ collection: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Update collection error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const collection = await prisma.collection.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    await prisma.collection.delete({
      where: { id: collection.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete collection error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
