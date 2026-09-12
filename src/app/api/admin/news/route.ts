export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().optional(),
  body: z.string().min(1),
  category: z.string().default("general"),
  imageUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
})

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.SYSTEM_SETTINGS)
    const body = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const news = await prisma.platformNews.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        summary: parsed.data.summary ?? null,
        body: parsed.data.body,
        category: parsed.data.category,
        imageUrl: parsed.data.imageUrl ?? null,
        isPublished: parsed.data.isPublished,
        publishedAt: parsed.data.isPublished ? new Date() : null,
        authorId: ctx.id,
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { newsId: news.id, title: news.title, slug: news.slug },
      { entityType: "PlatformNews", entityId: news.id },
    )

    return NextResponse.json({ news }, { status: 201 })
  } catch (error) {
    console.error("Create news error:", error)
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

    const news = await prisma.platformNews.findMany({
      where,
      include: { author: { select: { username: true, displayName: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json({ news })
  } catch (error) {
    console.error("Get news error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}