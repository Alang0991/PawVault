export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const ENVIRONMENTS = ["production", "staging", "development"] as const

const createSchema = z.object({
  key: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  enabled: z.boolean().default(false),
  rolloutPercent: z.number().int().min(0).max(100).default(0),
  targetUsers: z.any().optional(),
  targetRoles: z.any().optional(),
  environment: z.enum(ENVIRONMENTS).default("production"),
})

export async function GET() {
  try {
    await requireFounder()
    const flags = await prisma.featureFlag.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ flags })
  } catch (error) {
    console.error("Get feature flags error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireFounder()
    const body = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const flag = await prisma.featureFlag.create({
      data: {
        key: parsed.data.key,
        name: parsed.data.name,
        description: parsed.data.description,
        enabled: parsed.data.enabled,
        rolloutPercent: parsed.data.rolloutPercent,
        targetUsers: parsed.data.targetUsers,
        targetRoles: parsed.data.targetRoles,
        environment: parsed.data.environment,
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { flagKey: flag.key, flagName: flag.name },
      { entityType: "FeatureFlag", entityId: flag.id },
    )

    return NextResponse.json({ flag }, { status: 201 })
  } catch (error) {
    console.error("Create feature flag error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireFounder()
    const body = await request.json().catch(() => null)
    const idSchema = z.object({ flagId: z.string().min(1) })
    const idParsed = idSchema.safeParse(body)
    if (!idParsed.success) {
      return NextResponse.json({ error: "Missing flagId" }, { status: 400 })
    }

    const data = createSchema.pick({
      key: true,
      name: true,
      description: true,
      enabled: true,
      rolloutPercent: true,
      targetUsers: true,
      targetRoles: true,
      environment: true,
    }).safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: "Invalid input", details: data.error.flatten() }, { status: 400 })
    }

    const flag = await prisma.featureFlag.update({
      where: { id: body.flagId },
      data: data.data,
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { flagKey: flag.key, flagName: flag.name, changes: data.data },
      { entityType: "FeatureFlag", entityId: flag.id },
    )

    return NextResponse.json({ flag })
  } catch (error) {
    console.error("Update feature flag error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = await requireFounder()
    const body = await request.json().catch(() => null)
    const idSchema = z.object({ flagId: z.string().min(1) })
    const parsed = idSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Missing flagId" }, { status: 400 })
    }

    await prisma.featureFlag.delete({
      where: { id: body.flagId },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { deletedFlagId: body.flagId },
      { entityType: "FeatureFlag", entityId: body.flagId },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete feature flag error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}