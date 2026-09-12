import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { formatCurrency, getCurrencyInfo, BASE_CURRENCY } from "@/lib/currency"
import type { ExchangeRates } from "@/lib/currency"
import { detectCurrencyFromLocale } from "@/lib/currency"

let serverRatesCache: { rates: ExchangeRates; timestamp: number } | null = null
const CACHE_TTL = 1000 * 60 * 60

export async function getServerCurrency(): Promise<{
  currency: string
  rates: ExchangeRates
  locale: string
}> {
  const user = await getServerUser()
  let currency = BASE_CURRENCY
  let locale = "en-US"

  if (user) {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { currency: true, language: true },
    })
    currency = fullUser?.currency || BASE_CURRENCY
    const lang = fullUser?.language || "en"
    const langLocale = {
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      pt: "pt-BR",
      ja: "ja-JP",
      ko: "ko-KR",
      zh: "zh-CN",
    }
    locale = langLocale[lang as keyof typeof langLocale] || "en-US"
  }

  if (!user) {
    const acceptLanguage = headers().get("accept-language") || undefined
    const detected = detectCurrencyFromLocale(acceptLanguage || "")
    currency = detected
  }

  const rates = await getExchangeRates()

  return { currency, rates, locale }
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  if (serverRatesCache && Date.now() - serverRatesCache.timestamp < CACHE_TTL) {
    return serverRatesCache.rates
  }

  try {
    const dbRates = await prisma.currencyRate.findMany({
      where: { isEnabled: true },
      select: { code: true, rateToBase: true },
    })

    if (dbRates.length > 0) {
      const rates: ExchangeRates = {}
      for (const r of dbRates) {
        rates[r.code] = r.rateToBase
      }
      if (!rates[BASE_CURRENCY]) {
        rates[BASE_CURRENCY] = 1
      }
      serverRatesCache = { rates, timestamp: Date.now() }
      return rates
    }
  } catch (error) {
    console.error("Failed to fetch currency rates from DB:", error)
  }

  const fallback: ExchangeRates = {}
  for (const c of [BASE_CURRENCY]) {
    fallback[c] = 1
  }
  return fallback
}

export async function formatServerPrice(
  amount: number,
  currency?: string,
  locale?: string,
): Promise<string> {
  if (!currency || !locale) {
    const { currency: userCurrency, locale: userLocale } = await getServerCurrency()
    currency = currency || userCurrency
    locale = locale || userLocale
  }

  return formatCurrency(amount, currency, locale)
}

export function getCurrencyDisplayInfo(currency: string) {
  return getCurrencyInfo(currency) || getCurrencyInfo(BASE_CURRENCY)
}
