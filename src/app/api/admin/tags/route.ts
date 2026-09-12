export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const createSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tagType: z.string().max(50).optional(),
})

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.CATEGORIES_MANAGE)

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    const active = searchParams.get("active")

    const where: any = {}
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ]
    }
    if (active !== null && active !== undefined && active !== "") {
      where.isActive = active === "true"
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
      take: 200,
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("List tags error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE)

    const body = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const existing = await prisma.tag.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) {
      return NextResponse.json({ error: "Tag with this slug already exists" }, { status: 409 })
    }

    const tag = await prisma.tag.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
        tagType: parsed.data.tagType ?? null,
      },
    })

    await logAdminAction(ctx.id, AuditActions.CATEGORY_CREATED, { tagName: tag.name, tagSlug: tag.slug }, { entityType: "Tag", entityId: tag.id })

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Create tag error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
