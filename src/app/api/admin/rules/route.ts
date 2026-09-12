export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { PERMISSIONS } from "@/lib/permissions"

const createSchema = z.object({
  ruleType: z.string().min(1).max(50),
  scope: z.string().min(1).max(100),
  scopeId: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  config: z.record(z.unknown()).optional(),
  priority: z.number().int().default(0),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
})

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.MARKETPLACE_SETTINGS)

    const rules = await prisma.marketplaceRule.findMany({
      orderBy: [{ isActive: "desc" }, { priority: "asc" }],
    })

    return NextResponse.json({ rules })
  } catch (error) {
    console.error("Get marketplace rules error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requirePermission(PERMISSIONS.MARKETPLACE_SETTINGS)

    const body = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const rule = await prisma.marketplaceRule.create({
      data: {
        ruleType: parsed.data.ruleType,
        scope: parsed.data.scope,
        scopeId: parsed.data.scopeId ?? null,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        config: parsed.data.config as any,
        priority: parsed.data.priority,
        isActive: parsed.data.isActive,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
      },
    })

    await logAdminAction(
      ctx.id,
      AuditActions.CATEGORY_CREATED,
      { ruleName: rule.name, ruleType: rule.ruleType },
      { entityType: "MarketplaceRule", entityId: rule.id },
    )

    return NextResponse.json({ rule }, { status: 201 })
  } catch (error) {
    console.error("Create marketplace rule error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}