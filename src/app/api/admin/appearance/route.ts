export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const updateSchema = z.object({
  brandName: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
  headingFontFamily: z.string().optional().or(z.literal("")),
  borderRadius: z.string().optional(),
  shadowIntensity: z.string().optional(),
  motionEnabled: z.boolean().optional(),
  density: z.string().optional(),
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  analyticsEnabled: z.boolean().optional(),
  analyticsProvider: z.string().optional(),
  analyticsId: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
})

export async function GET() {
  try {
    await requireFounder()
    const config = await prisma.appearanceConfig.findUnique({
      where: { id: "singleton" },
    })
    return NextResponse.json({ config })
  } catch (error) {
    console.error("Get appearance error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireFounder()
    const body = await request.json().catch(() => null)
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const config = await prisma.appearanceConfig.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: {
        id: "singleton",
        ...parsed.data,
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { changes: parsed.data },
      { entityType: "AppearanceConfig", entityId: "singleton" },
    )

    return NextResponse.json({ config })
  } catch (error) {
    console.error("Update appearance error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}