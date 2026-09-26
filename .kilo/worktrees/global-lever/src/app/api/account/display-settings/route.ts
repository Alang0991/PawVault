export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { SUPPORTED_CURRENCIES } from "@/lib/currency"
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/i18n/localization"

const SUPPORTED_CURRENCY_CODES = SUPPORTED_CURRENCIES.map((c) => c.code)
const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code)
const SUPPORTED_THEMES = ["light", "dark", "system"]

const updateSchema = z.object({
  language: z.string().min(2).max(5).optional(),
  currency: z.string().min(3).max(5).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  accentColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).optional().nullable(),
  reduceMotion: z.boolean().optional(),
})

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        language: true,
        currency: true,
        theme: true,
        accentColor: true,
        reduceMotion: true,
      },
    })

    const enabledLanguages = await getEnabledLanguages()
    const enabledCurrencies = await getEnabledCurrencies()

    return NextResponse.json({
      settings: {
        language: settings?.language ?? DEFAULT_LANGUAGE,
        currency: settings?.currency ?? "USD",
        theme: settings?.theme ?? "system",
        accentColor: settings?.accentColor ?? "#8B5CF6",
        reduceMotion: settings?.reduceMotion ?? false,
      },
      supportedLanguages: enabledLanguages,
      supportedCurrencies: enabledCurrencies,
    })
  } catch (error) {
    console.error("Get display settings error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (parsed.data.language !== undefined) {
      if (!SUPPORTED_LANGUAGE_CODES.includes(parsed.data.language)) {
        return NextResponse.json({ error: "Unsupported language" }, { status: 400 })
      }
      updateData.language = parsed.data.language
    }
    if (parsed.data.currency !== undefined) {
      if (!SUPPORTED_CURRENCY_CODES.includes(parsed.data.currency.toUpperCase())) {
        return NextResponse.json({ error: "Unsupported currency" }, { status: 400 })
      }
      updateData.currency = parsed.data.currency.toUpperCase()
    }
    if (parsed.data.theme !== undefined) {
      if (!SUPPORTED_THEMES.includes(parsed.data.theme)) {
        return NextResponse.json({ error: "Invalid theme" }, { status: 400 })
      }
      updateData.theme = parsed.data.theme
    }
    if (parsed.data.accentColor !== undefined) {
      updateData.accentColor = parsed.data.accentColor
    }
    if (parsed.data.reduceMotion !== undefined) {
      updateData.reduceMotion = parsed.data.reduceMotion
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update display settings error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

async function getEnabledLanguages(): Promise<{ code: string; name: string; flag: string }[]> {
  try {
    const enabledLangs = await prisma.siteSetting.findMany({
      where: { key: { startsWith: "language_" } },
    })
    const enabledCodes = enabledLangs
      .filter((s) => s.value === "true")
      .map((s) => s.key.replace("language_", ""))

    if (enabledCodes.length === 0) {
      return SUPPORTED_LANGUAGES.map((l) => ({ code: l.code, name: l.name, flag: l.flag }))
    }

    return SUPPORTED_LANGUAGES.filter((lang) => enabledCodes.includes(lang.code))
      .map((l) => ({ code: l.code, name: l.name, flag: l.flag }))
  } catch {
    return SUPPORTED_LANGUAGES.map((l) => ({ code: l.code, name: l.name, flag: l.flag }))
  }
}

async function getEnabledCurrencies(): Promise<{ code: string; name: string; symbol: string }[]> {
  try {
    const currencySettings = await prisma.siteSetting.findMany({
      where: { key: { startsWith: "currency_" } },
    })
    const disabledCurrencies = currencySettings
      .filter((s) => s.value === "disabled")
      .map((s) => s.key.replace("currency_", ""))

    return SUPPORTED_CURRENCIES
      .filter((c) => !disabledCurrencies.includes(c.code))
      .map((c) => ({ code: c.code, name: c.name, symbol: c.symbol }))
  } catch {
    return SUPPORTED_CURRENCIES.map((c) => ({ code: c.code, name: c.name, symbol: c.symbol }))
  }
}
