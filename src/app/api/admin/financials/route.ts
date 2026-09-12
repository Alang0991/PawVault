export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"

const updateSchema = z.object({
  platformFeePercent: z.number().min(0).max(100).optional(),
  moderatorFeePercent: z.number().min(0).max(100).optional(),
  serverFeePercent: z.number().min(0).max(100).optional(),
  taxRatePercent: z.number().min(0).max(100).optional(),
  taxLabel: z.string().optional(),
  minimumPayout: z.number().positive().optional(),
  payoutSchedule: z.string().optional(),
  payoutHoldDays: z.number().int().min(0).optional(),
  defaultCurrency: z.string().min(1).max(10).optional(),
  supportedCurrencies: z.any().optional(),
  stripeConnectEnabled: z.boolean().optional(),
  stripeWebhookSigningSecret: z.string().optional(),
  invoiceEnabled: z.boolean().optional(),
  invoicePrefix: z.string().optional(),
  refundWindowDays: z.number().int().min(0).optional(),
  disputeWindowDays: z.number().int().min(0).optional(),
  chargebackReservePercent: z.number().min(0).max(100).optional(),
})

export async function GET() {
  try {
    await requireFounder()
    const config = await prisma.financeConfig.findUnique({
      where: { id: "singleton" },
    })
    return NextResponse.json({ config })
  } catch (error) {
    console.error("Get financials error:", error)
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

    const config = await prisma.financeConfig.upsert({
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
      { entityType: "FinanceConfig", entityId: "singleton" },
    )

    return NextResponse.json({ config })
  } catch (error) {
    console.error("Update financials error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}