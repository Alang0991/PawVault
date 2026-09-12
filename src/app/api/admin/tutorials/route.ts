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
  category: z.string().default("general"),
  tags: z.array(z.string()).default([]),
  readTime: z.number().int().min(1).optional(),
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

    const tutorial = await prisma.tutorial.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        summary: parsed.data.summary ?? null,
        body: parsed.data.body,
        category: parsed.data.category,
        tags: parsed.data.tags,
        readTime: parsed.data.readTime ?? null,
        isPublished: parsed.data.isPublished,
        publishedAt: parsed.data.isPublished ? new Date() : null,
        displayOrder: parsed.data.displayOrder,
        authorId: ctx.id,
      },
    })

    await logAdminAction(
      ctx.id,
      parsed.data.isPublished ? AuditActions.SETTINGS_UPDATED : AuditActions.SETTINGS_UPDATED,
      { tutorialId: tutorial.id, title: tutorial.title, slug: tutorial.slug },
      { entityType: "Tutorial", entityId: tutorial.id },
    )

    return NextResponse.json({ tutorial }, { status: 201 })
  } catch (error) {
    console.error("Create tutorial error:", error)
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

    const tutorials = await prisma.tutorial.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: {
        author: { select: { username: true, displayName: true } },
      },
    })

    return NextResponse.json({ tutorials })
  } catch (error) {
    console.error("Get tutorials error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}