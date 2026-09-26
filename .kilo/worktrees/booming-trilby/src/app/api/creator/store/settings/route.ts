export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCreatorAccess } from "@/lib/creator-access"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const storeSettingsSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(2000).optional(),
  socialLinks: z.record(z.string()).optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
})

export async function GET() {
  try {
    const access = await getCreatorAccess()
    if (!access.allowed) {
      return NextResponse.json({ error: access.error, code: access.code }, { status: access.status })
    }

    const store = await prisma.store.findUnique({ where: { userId: access.userId } })
    return NextResponse.json({ store })
  } catch (error) {
    console.error("Get store settings error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const access = await getCreatorAccess()
    if (!access.allowed) {
      return NextResponse.json({ error: access.error, code: access.code }, { status: access.status })
    }

    const body = await request.json()
    const validated = storeSettingsSchema.parse(body)

    const existing = await prisma.store.findUnique({ where: { userId: access.userId } })
    if (existing) {
      return NextResponse.json({ error: "Store already exists. Use PUT to update." }, { status: 409 })
    }

    if (validated.slug !== storeSlugFromName(validated.name)) {
      const slugClash = await prisma.store.findUnique({ where: { slug: validated.slug } })
      if (slugClash) {
        return NextResponse.json({ error: "That store slug is already taken" }, { status: 409 })
      }
    }

    const store = await prisma.store.create({
      data: {
        userId: access.userId,
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        socialLinks: validated.socialLinks ? JSON.stringify(validated.socialLinks) : undefined,
        visibility: "PUBLISHED",
      },
    })

    await createAuditLog({
      userId: access.userId,
      action: AuditActions.USER_PROFILE_UPDATED,
      details: { storeId: store.id, slug: validated.slug, action: "store_created" },
    })

    return NextResponse.json({ store }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    const message = error instanceof Error ? error.message : "Something went wrong"
    console.error("Create store error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function storeSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}


export async function PUT(request: Request) {
  try {
    const access = await getCreatorAccess()
    if (!access.allowed) {
      return NextResponse.json({ error: access.error, code: access.code }, { status: access.status })
    }

    const body = await request.json()
    const validated = storeSettingsSchema.parse(body)

    const store = await prisma.store.findUnique({ where: { userId: access.userId } })
    if (!store) {
      return NextResponse.json({ error: "Store not found. Create a store first." }, { status: 404 })
    }

    if (validated.slug !== store.slug) {
      const existing = await prisma.store.findUnique({ where: { slug: validated.slug } })
      if (existing) {
        return NextResponse.json({ error: "That store slug is already taken" }, { status: 409 })
      }
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        socialLinks: validated.socialLinks ? JSON.stringify(validated.socialLinks) : undefined,
        ...(validated.logo ? { logo: validated.logo } : {}),
        ...(validated.banner ? { banner: validated.banner } : {}),
      },
    })

    await createAuditLog({
      userId: access.userId,
      action: AuditActions.USER_PROFILE_UPDATED,
      details: { storeId: store.id, slug: validated.slug },
    })

    return NextResponse.json({ store: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    const message = error instanceof Error ? error.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
