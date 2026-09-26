export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"
import { SUPPORTED_CURRENCIES, BASE_CURRENCY } from "@/lib/currency"

const updateRateSchema = z.object({
  code: z.string().length(3),
  rateToBase: z.number().positive(),
  isEnabled: z.boolean().optional(),
})

export async function GET() {
  try {
    const rates = await prisma.currencyRate.findMany({
      orderBy: { code: "asc" },
    })

    if (rates.length === 0) {
      const fallback = SUPPORTED_CURRENCIES.map((c) => ({
        code: c.code,
        name: c.name,
        symbol: c.symbol,
        decimalDigits: c.decimalDigits,
        rateToBase: c.code === BASE_CURRENCY ? 1 : 1,
        isEnabled: true,
      }))
      return NextResponse.json({ rates: fallback, baseCurrency: BASE_CURRENCY })
    }

    return NextResponse.json({
      rates,
      baseCurrency: BASE_CURRENCY,
    })
  } catch (error) {
    console.error("Get currency rates error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireFounder()

    const body = await request.json()
    const parsed = updateRateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const currencyInfo = SUPPORTED_CURRENCIES.find(
      (c) => c.code === parsed.data.code.toUpperCase()
    )
    if (!currencyInfo) {
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
    }

    const rate = await prisma.currencyRate.upsert({
      where: { code: parsed.data.code.toUpperCase() },
      update: {
        rateToBase: parsed.data.rateToBase,
        isEnabled: parsed.data.isEnabled ?? true,
      },
      create: {
        code: parsed.data.code.toUpperCase(),
        name: currencyInfo.name,
        symbol: currencyInfo.symbol,
        decimalDigits: currencyInfo.decimalDigits,
        rateToBase: parsed.data.rateToBase,
        isEnabled: parsed.data.isEnabled ?? true,
      },
    })

    return NextResponse.json({ rate })
  } catch (error) {
    console.error("Update currency rate error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireFounder()

    const body = await request.json()
    const parsed = updateRateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const currencyInfo = SUPPORTED_CURRENCIES.find(
      (c) => c.code === parsed.data.code.toUpperCase()
    )
    if (!currencyInfo) {
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
    }

    const rate = await prisma.currencyRate.create({
      data: {
        code: parsed.data.code.toUpperCase(),
        name: currencyInfo.name,
        symbol: currencyInfo.symbol,
        decimalDigits: currencyInfo.decimalDigits,
        rateToBase: parsed.data.rateToBase,
        isEnabled: parsed.data.isEnabled ?? true,
      },
    })

    return NextResponse.json({ rate })
  } catch (error) {
    console.error("Create currency rate error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireFounder()

    const body = await request.json()
    const codeSchema = z.object({ code: z.string().length(3) })
    const parsed = codeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    await prisma.currencyRate.delete({
      where: { code: parsed.data.code.toUpperCase() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete currency rate error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
