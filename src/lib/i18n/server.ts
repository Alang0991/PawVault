import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { getExchangeRates } from "@/lib/currency-server"
import type { ExchangeRates } from "@/lib/currency"
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLocaleFromCookie,
} from "@/lib/i18n/localization"

export async function getEnabledLanguageCodes(): Promise<string[]> {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { startsWith: "language_" } },
      select: { key: true, value: true },
    })
    const enabled = settings
      .filter((s) => s.value === "true")
      .map((s) => s.key.replace("language_", ""))
    return enabled.length > 0
      ? Array.from(new Set([DEFAULT_LANGUAGE, ...enabled]))
      : SUPPORTED_LANGUAGES.map((l) => l.code)
  } catch {
    return SUPPORTED_LANGUAGES.map((l) => l.code)
  }
}

export async function getUserLocale(): Promise<{
  locale: string
  language: string
  currency: string
  theme: string
  accentColor: string | null
  reduceMotion: boolean
  currencyRates: ExchangeRates
  ratesUpdatedAt: string | null
  ratesSource: string
}> {
  const user = await getServerUser()
  const { rates, updatedAt, source } = await getExchangeRates()

  if (user) {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        language: true,
        currency: true,
        theme: true,
        accentColor: true,
        reduceMotion: true,
      },
    })

    if (fullUser) {
      return {
        locale: fullUser.language ?? DEFAULT_LANGUAGE,
        language: fullUser.language ?? DEFAULT_LANGUAGE,
        currency: fullUser.currency ?? "USD",
        theme: fullUser.theme ?? "system",
        accentColor: fullUser.accentColor ?? "#8B5CF6",
        reduceMotion: fullUser.reduceMotion ?? false,
        currencyRates: rates,
        ratesUpdatedAt: updatedAt,
        ratesSource: source,
      }
    }
  }

  const headersList = headers()
  const cookieHeader = headersList.get("cookie") || ""
  const detectedLocale = getLocaleFromCookie(cookieHeader)

  return {
    locale: detectedLocale,
    language: detectedLocale,
    currency: "USD",
    theme: "system",
    accentColor: null,
    reduceMotion: false,
    currencyRates: rates,
    ratesUpdatedAt: updatedAt,
    ratesSource: source,
  }
}

export function getSupportedLocale(locale: string): string {
  const code = locale.split("-")[0].toLowerCase()
  if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
    return code
  }
  return DEFAULT_LANGUAGE
}
