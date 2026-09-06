export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const ctx = await requireAdminOrFounder()

    const body = await request.json().catch(() => null)
    const parsed = createCategorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        parentId: parsed.data.parentId || null,
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.CATEGORY_CREATED,
      { name: category.name, slug: category.slug },
      { entityType: "Category", entityId: category.id },
    )

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
