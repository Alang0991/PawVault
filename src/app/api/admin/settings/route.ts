export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const updateConfigSchema = z.object({
  platformFeePercent: z.number().min(0).max(100).optional(),
  moderatorFeePercent: z.number().min(0).max(100).optional(),
  serverFeePercent: z.number().min(0).max(100).optional(),
  currency: z.string().min(1).max(10).optional(),
  stripeConnectEnabled: z.boolean().optional(),
})

export async function GET() {
  try {
    await requireFounder()

    const config = await prisma.platformConfig.findUnique({
      where: { id: "singleton" },
    })

    const siteSettings = await prisma.siteSetting.findMany()

    return NextResponse.json({
      config,
      siteSettings: Object.fromEntries(siteSettings.map((s) => [s.key, s.value])),
    })
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireFounder()

    const body = await request.json().catch(() => null)
    const parsed = updateConfigSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const config = await prisma.platformConfig.upsert({
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
      { entityType: "PlatformConfig", entityId: "singleton" },
    )

    return NextResponse.json({ config })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Update settings error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireFounder()

    const fd = await request.formData().catch(() => null)
    let payload: any
    if (fd) {
      payload = {
        platformFeePercent: fd.get("platformFeePercent") ? parseFloat(fd.get("platformFeePercent") as string) : undefined,
        moderatorFeePercent: fd.get("moderatorFeePercent") ? parseFloat(fd.get("moderatorFeePercent") as string) : undefined,
        serverFeePercent: fd.get("serverFeePercent") ? parseFloat(fd.get("serverFeePercent") as string) : undefined,
        currency: fd.get("currency") || undefined,
        stripeConnectEnabled: fd.get("stripeConnectEnabled") === "true",
      }
    } else {
      payload = await request.json().catch(() => ({}))
    }

    const parsed = updateConfigSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 })
    }

    const config = await prisma.platformConfig.upsert({
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
      { entityType: "PlatformConfig", entityId: "singleton" },
    )

    return NextResponse.json({ config })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      )
    }
    console.error("Update settings error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
