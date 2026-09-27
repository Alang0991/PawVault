"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react"
import {
  getCurrencyInfo,
  formatCurrency,
  getSupportedCurrencyCodes,
  convertForDisplay,
  BASE_CURRENCY,
} from "@/lib/currency"
import type { ExchangeRates, CurrencyInfo } from "@/lib/currency"

export interface CurrencyContextValue {
  currency: string
  displayCurrency: string
  baseCurrency: string
  setCurrency: (code: string) => Promise<boolean>
  setDisplayCurrency: (code: string) => Promise<boolean>
  syncDisplayCurrency: (code: string) => void
  rates: ExchangeRates
  lastUpdated: string | null
  source: string
  supportedCurrencies: { code: string; name: string; symbol: string }[]
  hasConversion: boolean
  isLoadingRates: boolean
  convertAmount: (amount: number) => number
  formatAmount: (amount: number) => string
  currencyInfo: CurrencyInfo | undefined
}

const defaultCurrencyContext: CurrencyContextValue = {
  currency: BASE_CURRENCY,
  displayCurrency: BASE_CURRENCY,
  baseCurrency: BASE_CURRENCY,
  setCurrency: async () => false,
  setDisplayCurrency: async () => false,
  syncDisplayCurrency: () => {},
  rates: { [BASE_CURRENCY]: 1 },
  lastUpdated: null,
  source: "default",
  supportedCurrencies: [],
  hasConversion: false,
  isLoadingRates: false,
  convertAmount: (amount: number) => amount,
  formatAmount: (amount: number) => formatCurrency(amount, BASE_CURRENCY),
  currencyInfo: undefined,
}

const CurrencyContext = createContext<CurrencyContextValue>(defaultCurrencyContext)

export interface CurrencyProviderProps {
  children: ReactNode
  initialCurrency?: string
  initialRates?: ExchangeRates
  initialRatesUpdatedAt?: string | null
  initialRatesSource?: string
}

export function CurrencyProvider({
  children,
  initialCurrency,
  initialRates,
  initialRatesUpdatedAt,
  initialRatesSource,
}: CurrencyProviderProps) {
  const initialNormalized =
    initialCurrency &&
    getSupportedCurrencyCodes().includes(initialCurrency.toUpperCase())
      ? initialCurrency.toUpperCase()
      : BASE_CURRENCY

  const [displayCurrency, setDisplayCurrencyState] = useState<string>(initialNormalized)
  const [rates, setRates] = useState<ExchangeRates>(
    initialRates && Object.keys(initialRates).length > 0
      ? initialRates
      : { [BASE_CURRENCY]: 1 },
  )
  const [lastUpdated, setLastUpdated] = useState<string | null>(
    initialRatesUpdatedAt ?? null,
  )
  const [source, setSource] = useState<string>(initialRatesSource ?? "default")
  const supportedList = getSupportedCurrencyCodes()
  const [supportedCurrencies, setSupportedCurrencies] = useState<
    { code: string; name: string; symbol: string }[]
  >(
    supportedList.map((code) => ({
      code,
      name: getCurrencyInfo(code)?.name ?? code,
      symbol: getCurrencyInfo(code)?.symbol ?? code,
    })),
  )
  const [isLoadingRates, setIsLoadingRates] = useState(false)

  useEffect(() => {
    const normalized =
      initialCurrency && getSupportedCurrencyCodes().includes(initialCurrency.toUpperCase())
        ? initialCurrency.toUpperCase()
        : BASE_CURRENCY
    setDisplayCurrencyState(normalized)
  }, [initialCurrency])

  useEffect(() => {
    let cancelled = false
    fetch('/api/account/display-settings', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return null
        return res.json()
      })
      .then((data) => {
        if (cancelled || !data?.supportedCurrencies?.length) return
        setSupportedCurrencies(data.supportedCurrencies)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (initialRates && Object.keys(initialRates).length > 0) {
      setRates(initialRates)
      setLastUpdated(initialRatesUpdatedAt ?? null)
      setSource(initialRatesSource ?? "default")
    }
  }, [initialRates, initialRatesUpdatedAt, initialRatesSource])

  const hasConversion =
    displayCurrency !== BASE_CURRENCY &&
    Boolean(rates[displayCurrency]) &&
    (rates[displayCurrency] ?? 0) > 0

  const convertAmount = useCallback(
    (amount: number): number => {
      const { value } = convertForDisplay(
        amount,
        BASE_CURRENCY,
        displayCurrency,
        rates,
      )
      return value
    },
    [displayCurrency, rates],
  )

  const formatAmount = useCallback(
    (amount: number): string => {
      const { value, currency } = convertForDisplay(
        amount,
        BASE_CURRENCY,
        displayCurrency,
        rates,
      )
      return formatCurrency(value, currency)
    },
    [displayCurrency, rates],
  )

  const setDisplayCurrency = useCallback(
    async (code: string): Promise<boolean> => {
      const normalized = code.toUpperCase()
      if (!supportedCurrencies.some((currency) => currency.code === normalized)) return false

      try {
        const res = await fetch("/api/account/display-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ currency: normalized }),
        })

        if (res.ok) {
          setDisplayCurrencyState(normalized)
          return true
        }

        if (res.status === 401) {
          // Not authenticated: remember the choice for this session only, but
          // do not claim it was persisted, and do not log the user out.
          setDisplayCurrencyState(normalized)
          return false
        }

        return false
      } catch {
        return false
      }
    },
    [supportedCurrencies],
  )

  const syncDisplayCurrency = useCallback(
    (code: string): void => {
      const normalized = code.toUpperCase()
      if (supportedCurrencies.some((currency) => currency.code === normalized)) {
        setDisplayCurrencyState(normalized)
      }
    },
    [supportedCurrencies],
  )

  const value: CurrencyContextValue = {
    currency: displayCurrency,
    displayCurrency,
    baseCurrency: BASE_CURRENCY,
    setCurrency: setDisplayCurrency,
    setDisplayCurrency,
    syncDisplayCurrency,
    rates,
    lastUpdated,
    source,
    supportedCurrencies,
    hasConversion,
    isLoadingRates,
    convertAmount,
    formatAmount,
    currencyInfo: getCurrencyInfo(displayCurrency) ?? getCurrencyInfo(BASE_CURRENCY),
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    return defaultCurrencyContext
  }
  return ctx
}
