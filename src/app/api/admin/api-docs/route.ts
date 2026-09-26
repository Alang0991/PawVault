export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  summary: z.string().optional(),
  body: z.string().min(1),
  endpoint: z.string().optional(),
  method: z.string().optional(),
  category: z.string().default("general"),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
})

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS)

    const body = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const doc = await prisma.aPIDocument.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        summary: parsed.data.summary ?? null,
        body: parsed.data.body,
        endpoint: parsed.data.endpoint ?? null,
        method: parsed.data.method ?? null,
        category: parsed.data.category,
        tags: parsed.data.tags,
        isPublished: parsed.data.isPublished,
        publishedAt: parsed.data.isPublished ? new Date() : null,
        displayOrder: parsed.data.displayOrder,
        authorId: ctx.id,
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { docId: doc.id, title: doc.title, slug: doc.slug },
      { entityType: "APIDocument", entityId: doc.id },
    )

    return NextResponse.json({ doc }, { status: 201 })
  } catch (error) {
    console.error("Create API doc error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.SYSTEM_SETTINGS)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    const where: any = {}
    if (status === "published") where.isPublished = true
    else if (status === "draft") where.isPublished = false

    const docs = await prisma.aPIDocument.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: {
        author: { select: { username: true, displayName: true } },
      },
    })

    return NextResponse.json({ docs })
  } catch (error) {
    console.error("Get API docs error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}