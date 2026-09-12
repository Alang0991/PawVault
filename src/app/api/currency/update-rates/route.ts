export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { SUPPORTED_CURRENCIES, BASE_CURRENCY } from "@/lib/currency"

export async function POST(request: Request) {
  try {
    const ctx = await requireFounder()

    const body = await request.json().catch(() => ({}))
    const manualRates: Record<string, number> = body.manualRates || {}

    let externalRates: Record<string, number> = {}

    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`, {
        next: { revalidate: 0 },
      })
      if (res.ok) {
        const data = await res.json()
        externalRates = data.rates || {}
      }
    } catch (error) {
      console.error("Failed to fetch external exchange rates:", error)
    }

    const now = new Date()
    const updated: string[] = []

    for (const currency of SUPPORTED_CURRENCIES) {
      let rate: number | null = null

      if (manualRates[currency.code] !== undefined) {
        rate = manualRates[currency.code]
      } else if (externalRates[currency.code]) {
        rate = externalRates[currency.code]
      }

      if (rate !== null) {
        await prisma.currencyRate.upsert({
          where: { code: currency.code },
          update: {
            rateToBase: rate,
            name: currency.name,
            symbol: currency.symbol,
            decimalDigits: currency.decimalDigits,
            isEnabled: true,
            updatedAt: now,
          },
          create: {
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
            decimalDigits: currency.decimalDigits,
            rateToBase: rate,
            isEnabled: true,
          },
        })
        updated.push(currency.code)
      }
    }

    await logAdminAction(
      ctx.id,
      AuditActions.SETTINGS_UPDATED,
      { changes: { action: "currency_rates_updated", updated } },
      { entityType: "CurrencyRate", entityId: "all" },
    )

    return NextResponse.json({ success: true, updated, baseCurrency: BASE_CURRENCY })
  } catch (error) {
    console.error("Update exchange rates error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
