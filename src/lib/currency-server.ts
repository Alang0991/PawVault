import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import {
  formatCurrency,
  formatDate,
  getCurrencyInfo,
  BASE_CURRENCY,
  convertForDisplay,
} from "@/lib/currency"
import type { ExchangeRates } from "@/lib/currency"
import { detectCurrencyFromLocale } from "@/lib/currency"
import { getLocaleFromCookie, getLocaleForLanguage } from "@/lib/i18n/localization"

/**
 * In-memory cache for exchange rates. The rates are the single, defined
 * exchange-rate source for the platform (the `CurrencyRate` table) plus the
 * timestamp of the most recent update, so displays can be attributed to a
 * real rate as-of time rather than a fabricated value.
 */
let serverRatesCache: {
  rates: ExchangeRates
  updatedAt: string | null
  source: string
  timestamp: number
} | null = null
const CACHE_TTL = 1000 * 60 * 30

export interface ServerCurrencyContext {
  currency: string
  baseCurrency: string
  locale: string
  rates: ExchangeRates
  ratesUpdatedAt: string | null
  ratesSource: string
}

export async function getExchangeRates(): Promise<{
  rates: ExchangeRates
  updatedAt: string | null
  source: string
}> {
  if (
    serverRatesCache &&
    Date.now() - serverRatesCache.timestamp < CACHE_TTL
  ) {
    return {
      rates: serverRatesCache.rates,
      updatedAt: serverRatesCache.updatedAt,
      source: serverRatesCache.source,
    }
  }

  try {
    const dbRates = await prisma.currencyRate.findMany({
      where: { isEnabled: true },
      select: { code: true, rateToBase: true, updatedAt: true },
      orderBy: { code: "asc" },
    })

    if (dbRates.length > 0) {
      const rates: ExchangeRates = {}
      let latest: Date | null = null
      for (const r of dbRates) {
        rates[r.code.toUpperCase()] = r.rateToBase
        const updated = new Date(r.updatedAt)
        if (!latest || updated > latest) {
          latest = updated
        }
      }
      if (!rates[BASE_CURRENCY.toUpperCase()]) {
        rates[BASE_CURRENCY.toUpperCase()] = 1
      }
      const result = {
        rates,
        updatedAt: latest?.toISOString() ?? null,
        source: "database",
      }
      serverRatesCache = { ...result, timestamp: Date.now() }
      return result
    }
  } catch (error) {
    console.error("Failed to fetch currency rates from DB:", error)
  }

  // No real exchange-rate source configured. Only the base/transaction
  // currency is available; we deliberately do NOT fabricate rates for other
  // currencies, otherwise we would "pretend" to convert.
  const fallback: ExchangeRates = { [BASE_CURRENCY.toUpperCase()]: 1 }
  return { rates: fallback, updatedAt: null, source: "default" }
}

export async function getServerCurrency(): Promise<ServerCurrencyContext> {
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
    locale = getLocaleForLanguage(lang)
  }

  if (!user) {
    const acceptLanguage = headers().get("accept-language") || undefined
    const detected = detectCurrencyFromLocale(acceptLanguage || "")
    currency = detected
    const cookieHeader = headers().get("cookie") || ""
    locale = getLocaleForLanguage(getLocaleFromCookie(cookieHeader))
  }

  const { rates, updatedAt, source } = await getExchangeRates()

  return {
    currency,
    baseCurrency: BASE_CURRENCY,
    locale,
    rates,
    ratesUpdatedAt: updatedAt,
    ratesSource: source,
  }
}

/**
 * Formats an amount for display, converting it from its source currency
 * (typically the platform base/transaction currency) into the user's preferred
 * display currency when a real exchange rate is available.
 *
 * This NEVER pretends to convert: if no real rate exists the amount is shown
 * in its source currency. Transaction records (orders, refunds, payouts) keep
 * their own currency and are only re-formatted for display here.
 */
export async function formatServerPrice(
  amount: number,
  currency?: string,
  locale?: string,
): Promise<string> {
  const ctx = await getServerCurrency()
  const source = (currency || ctx.baseCurrency).toUpperCase()
  const { value, currency: displayCurrency } = convertForDisplay(
    amount,
    source,
    ctx.currency,
    ctx.rates,
  )
  return formatCurrency(value, displayCurrency, locale || ctx.locale)
}

/**
 * Synchronous price formatter bound to an already-resolved server currency
 * context. Use this to avoid re-resolving the context for every line item.
 */
export function makeServerPriceFormatter(ctx: ServerCurrencyContext) {
  return (amount: number, currency?: string) => {
    const source = (currency || ctx.baseCurrency).toUpperCase()
    const { value, currency: displayCurrency } = convertForDisplay(
      amount,
      source,
      ctx.currency,
      ctx.rates,
    )
    return formatCurrency(value, displayCurrency, ctx.locale)
  }
}

/**
 * Formats a date for display using the requesting user's locale, centralizing
 * locale-aware date/time formatting so components never hardcode "en-US".
 */
export async function formatServerDate(
  date: Date | string,
  locale?: string,
): Promise<string> {
  const ctx = await getServerCurrency()
  return formatDate(date, locale || ctx.locale)
}

export function getCurrencyDisplayInfo(currency: string) {
  return getCurrencyInfo(currency) || getCurrencyInfo(BASE_CURRENCY)
}