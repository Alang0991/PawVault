export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { getAllSeasonalThemes, getSeasonalTheme } from "@/lib/seasonal-themes"

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isEnabled: z.boolean().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  config: z.record(z.unknown()).optional(),
  displayOrder: z.number().int().min(0).optional(),
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const includeDefaults = url.searchParams.get("includeDefaults") === "true"
    const slug = url.searchParams.get("slug")

    if (slug) {
      const theme = await prisma.seasonalTheme.findUnique({
        where: { slug },
      })
      if (!theme) {
        const builtin = getSeasonalTheme(slug)
        if (builtin) {
          return NextResponse.json({ theme: { ...builtin, isBuiltIn: true } })
        }
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      return NextResponse.json({ theme })
    }

    const dbThemes = await prisma.seasonalTheme.findMany({
      orderBy: { displayOrder: "asc" },
    })

    if (includeDefaults) {
      const builtIn = getAllSeasonalThemes()
      const dbSlugs = new Set(dbThemes.map((t) => t.slug))
      const defaults = builtIn.filter((t) => !dbSlugs.has(t.slug))
      return NextResponse.json({ themes: [...dbThemes, ...defaults] })
    }

    return NextResponse.json({ themes: dbThemes })
  } catch (error) {
    console.error("Get seasonal themes error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireFounder()

    const body = await request.json()
    const parsed = updateSchema.extend({
      name: z.string().min(1).max(100),
      slug: z.string().min(1).max(100),
    }).safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const existing = await prisma.seasonalTheme.findUnique({
      where: { slug: parsed.data.slug },
    })
    if (existing) {
      return NextResponse.json({ error: "Theme with this slug already exists" }, { status: 409 })
    }

    const theme = await prisma.seasonalTheme.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        isEnabled: parsed.data.isEnabled ?? true,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        config: parsed.data.config as any,
        displayOrder: parsed.data.displayOrder ?? 0,
      },
    })

    return NextResponse.json({ theme })
  } catch (error) {
    console.error("Create seasonal theme error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireFounder()

    const body = await request.json()
    const idSchema = z.object({
      id: z.string().min(1),
    })
    const idParsed = idSchema.safeParse(body)
    if (!idParsed.success) {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 })
    }

    const data = updateSchema.safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: "Invalid input", details: data.error.flatten() }, { status: 400 })
    }

    const theme = await prisma.seasonalTheme.update({
      where: { id: body.id },
      data: {
        name: data.data.name,
        slug: data.data.slug,
        description: data.data.description,
        isEnabled: data.data.isEnabled,
        startDate: data.data.startDate,
        endDate: data.data.endDate,
        config: data.data.config as any,
        displayOrder: data.data.displayOrder,
      },
    })

    return NextResponse.json({ theme })
  } catch (error) {
    console.error("Update seasonal theme error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireFounder()

    const body = await request.json()
    const idSchema = z.object({
      id: z.string().min(1),
    })
    const parsed = idSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 })
    }

    await prisma.seasonalTheme.delete({
      where: { id: body.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete seasonal theme error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
