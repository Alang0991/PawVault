export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  tagType: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requirePermission(PERMISSIONS.CATEGORIES_MANAGE)

    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: { products: { include: { product: { select: { id: true, title: true, slug: true } } }, take: 20 } },
    })

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    return NextResponse.json({ tag })
  } catch (error) {
    console.error("Get tag error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE)

    const body = await request.json().catch(() => null)
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const existing = await prisma.tag.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    const data: any = {}
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) data[key] = value
    }

    const updated = await prisma.tag.update({ where: { id: params.id }, data })

    await logAdminAction(ctx.id, AuditActions.CATEGORY_UPDATED, { tagName: updated.name, tagSlug: updated.slug }, { entityType: "Tag", entityId: updated.id })

    return NextResponse.json({ tag: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Update tag error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE)

    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: { _count: { select: { products: true } } },
    })

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    if (tag._count.products > 0) {
      return NextResponse.json({ error: "Cannot delete tag with assigned products. Remove assignments first." }, { status: 409 })
    }

    await prisma.tag.delete({ where: { id: params.id } })

    await logAdminAction(ctx.id, AuditActions.CATEGORY_DELETED, { tagName: tag.name, tagSlug: tag.slug }, { entityType: "Tag", entityId: params.id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete tag error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
