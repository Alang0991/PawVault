export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  parentId: z.string().nullable().optional(),
})

async function updateCategory(id: string, data: z.infer<typeof updateCategorySchema>, ctx: Awaited<ReturnType<typeof requirePermission>>) {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) {
    throw new Error("Category not found")
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
    },
  })

  await logAdminAction(
    ctx.id,
    AuditActions.CATEGORY_UPDATED,
    { name: updated.name, slug: updated.slug },
    { entityType: "Category", entityId: updated.id },
  )

  return updated
}

async function deleteCategory(id: string, ctx: Awaited<ReturnType<typeof requirePermission>>) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true, children: true } } },
  })
  if (!category) {
    throw new Error("Category not found")
  }

  if (category._count.products > 0 || category._count.children > 0) {
    throw new Error("Cannot delete category with products or subcategories. Reassign them first.")
  }

  await prisma.category.delete({ where: { id } })

  await logAdminAction(
    ctx.id,
    AuditActions.CATEGORY_DELETED,
    { name: category.name, slug: category.slug },
    { entityType: "Category", entityId: id },
  )
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE)

    const body = await request.json().catch(() => null)
    const parsed = updateCategorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const updated = await updateCategory(params.id, parsed.data, ctx)
    return NextResponse.json({ category: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Update category error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE)

    await deleteCategory(params.id, ctx)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const fd = await request.formData().catch(() => null)
  let payload: any
  if (fd) {
    const method = fd.get("_method")
    if (method === "PUT") {
      payload = {
        name: fd.get("name"),
        slug: fd.get("slug"),
        description: fd.get("description") || undefined,
        parentId: fd.get("parentId") ? fd.get("parentId") : null,
      }
      const parsed = updateCategorySchema.safeParse(payload)
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input." }, { status: 400 })
      }
      try {
        const ctx = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE)
        const updated = await updateCategory(params.id, parsed.data, ctx)
        return NextResponse.json({ category: updated })
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
      }
    } else if (method === "DELETE") {
      try {
        const ctx = await requirePermission(PERMISSIONS.CATEGORIES_MANAGE)
        await deleteCategory(params.id, ctx)
        return NextResponse.json({ success: true })
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
