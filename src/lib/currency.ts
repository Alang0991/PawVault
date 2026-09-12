export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  decimalDigits: number
  locale: string
  flag: string
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$", decimalDigits: 2, locale: "en-US", flag: "$" },
  { code: "EUR", name: "Euro", symbol: "€", decimalDigits: 2, locale: "de-DE", flag: "€" },
  { code: "GBP", name: "British Pound", symbol: "£", decimalDigits: 2, locale: "en-GB", flag: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", decimalDigits: 0, locale: "ja-JP", flag: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", decimalDigits: 2, locale: "en-CA", flag: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", decimalDigits: 2, locale: "en-AU", flag: "A$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", decimalDigits: 0, locale: "ko-KR", flag: "₩" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", decimalDigits: 2, locale: "zh-CN", flag: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimalDigits: 2, locale: "de-CH", flag: "CHF" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", decimalDigits: 2, locale: "en-IN", flag: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", decimalDigits: 2, locale: "pt-BR", flag: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", decimalDigits: 2, locale: "es-MX", flag: "$" },
]

export const BASE_CURRENCY = "USD"

export interface ExchangeRates {
  [currencyCode: string]: number
}

let cachedRates: ExchangeRates | null = null
let ratesLastFetched: Date | null = null

export function getCurrencyInfo(code: string): CurrencyInfo | undefined {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code.toUpperCase())
}

export function getSupportedCurrencyCodes(): string[] {
  return SUPPORTED_CURRENCIES.map((c) => c.code)
}

export function detectCurrencyFromLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    "en-US": "USD",
    "en-GB": "GBP",
    "en-AU": "AUD",
    "en-CA": "CAD",
    "de-DE": "EUR",
    "fr-FR": "EUR",
    "es-ES": "EUR",
    "it-IT": "EUR",
    "nl-NL": "EUR",
    "pt-PT": "EUR",
    "pt-BR": "BRL",
    "ja-JP": "JPY",
    "ko-KR": "KRW",
    "zh-CN": "CNY",
    "zh-TW": "CNY",
    "de-CH": "CHF",
    "fr-CH": "CHF",
    "it-CH": "CHF",
    "en-IN": "INR",
    "es-MX": "MXN",
    "en-DE": "EUR",
    "sv-SE": "SEK",
    "no-NO": "NOK",
    "da-DK": "DKK",
    "fi-FI": "EUR",
    "pl-PL": "PLN",
    "ru-RU": "RUB",
    "tr-TR": "TRY",
    "id-ID": "IDR",
    "th-TH": "THB",
    "vi-VN": "VND",
    "ms-MY": "MYR",
  }

  for (const [loc, currency] of Object.entries(localeMap)) {
    if (locale.toLowerCase().startsWith(loc.toLowerCase())) {
      return currency
    }
  }

  return BASE_CURRENCY
}

export function detectCurrencyFromCountry(countryCode: string): string {
  const countryCurrencyMap: Record<string, string> = {
    US: "USD",
    GB: "GBP",
    EU: "EUR",
    DE: "EUR",
    FR: "EUR",
    ES: "EUR",
    IT: "EUR",
    NL: "EUR",
    PT: "EUR",
    AT: "EUR",
    BE: "EUR",
    IE: "EUR",
    FI: "EUR",
    GR: "EUR",
    BR: "BRL",
    MX: "MXN",
    JP: "JPY",
    KR: "KRW",
    CN: "CNY",
    TW: "CNY",
    CH: "CHF",
    IN: "INR",
    CA: "CAD",
    AU: "AUD",
    SE: "SEK",
    NO: "NOK",
    DK: "DKK",
    PL: "PLN",
    RU: "RUB",
    TR: "TRY",
    ID: "IDR",
    TH: "THB",
    VN: "VND",
    MY: "MYR",
  }

  return countryCurrencyMap[countryCode.toUpperCase()] || BASE_CURRENCY
}

export function formatCurrency(
  amount: number,
  currency: string = BASE_CURRENCY,
  locale?: string,
): string {
  const currencyInfo = getCurrencyInfo(currency)
  const targetLocale = locale || currencyInfo?.locale || "en-US"

  try {
    return new Intl.NumberFormat(targetLocale, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: currencyInfo?.decimalDigits ?? 2,
      maximumFractionDigits: currencyInfo?.decimalDigits ?? 2,
    }).format(amount)
  } catch {
    const sym = currencyInfo?.symbol || currency
    return `${sym}${amount.toFixed(currencyInfo?.decimalDigits ?? 2)}`
  }
}

export function formatPrice(
  amount: number,
  currency: string = BASE_CURRENCY,
  locale?: string,
): string {
  return formatCurrency(amount, currency, locale)
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  if (cachedRates && ratesLastFetched && Date.now() - ratesLastFetched.getTime() < 1000 * 60 * 60) {
    return cachedRates
  }

  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error("Exchange rate fetch failed")
    const data = await res.json()
    cachedRates = data.rates as ExchangeRates
    ratesLastFetched = new Date()
    return cachedRates
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error)
    const fallback: ExchangeRates = {}
    for (const c of SUPPORTED_CURRENCIES) {
      fallback[c.code] = c.code === BASE_CURRENCY ? 1 : 1
    }
    return fallback
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates,
): number {
  const fromRate = rates[fromCurrency.toUpperCase()] ?? 1
  const toRate = rates[toCurrency.toUpperCase()] ?? 1

  if (!fromRate || !toRate) return amount

  const amountInBase = amount / fromRate
  return amountInBase * toRate
}

export function roundCurrency(amount: number, currency: string): number {
  const currencyInfo = getCurrencyInfo(currency)
  const decimals = currencyInfo?.decimalDigits ?? 2
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export interface CurrencyOption {
  value: string
  label: string
  symbol: string
}

export function getCurrencyOptions(): CurrencyOption[] {
  return SUPPORTED_CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.name}`,
    symbol: c.symbol,
  }))
}

export function normalizeCurrency(code: string): string {
  return code.toUpperCase()
}
