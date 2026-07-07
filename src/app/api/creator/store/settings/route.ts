export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
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
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["CREATOR", "VERIFIED_CREATOR", "ADMIN", "OWNER"].includes(user.role)) {
      return NextResponse.json({ error: "Creator account required" }, { status: 403 })
    }

    const store = await prisma.store.findUnique({ where: { userId: user.id } })
    return NextResponse.json({ store })
  } catch (error) {
    console.error("Get store settings error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["CREATOR", "VERIFIED_CREATOR", "ADMIN", "OWNER"].includes(user.role)) {
      return NextResponse.json({ error: "Creator account required" }, { status: 403 })
    }

    const body = await request.json()
    const validated = storeSettingsSchema.parse(body)

    const store = await prisma.store.findUnique({ where: { userId: user.id } })
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
      userId: user.id,
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
