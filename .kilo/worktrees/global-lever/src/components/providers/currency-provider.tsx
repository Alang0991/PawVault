"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import {
  getCurrencyInfo,
  detectCurrencyFromLocale,
  formatCurrency,
  getSupportedCurrencyCodes,
  type CurrencyInfo,
} from "@/lib/currency"
import { fetchExchangeRates, convertCurrency, roundCurrency, type ExchangeRates } from "@/lib/currency"
import { BASE_CURRENCY } from "@/lib/currency"

export interface CurrencyContextValue {
  currency: string
  setCurrency: (code: string) => void
  displayCurrency: string
  setDisplayCurrency: (code: string) => void
  baseCurrency: string
  rates: ExchangeRates
  isLoadingRates: boolean
  convertAmount: (amount: number) => number
  formatAmount: (amount: number) => string
  currencyInfo: CurrencyInfo | undefined
}

const defaultCurrencyContext: CurrencyContextValue = {
  currency: "USD",
  setCurrency: () => {},
  displayCurrency: "USD",
  setDisplayCurrency: () => {},
  baseCurrency: "USD",
  rates: {},
  isLoadingRates: false,
  convertAmount: (amount: number) => amount,
  formatAmount: (amount: number) => `$${amount.toFixed(2)}`,
  currencyInfo: undefined,
}

const CurrencyContext = createContext<CurrencyContextValue>(defaultCurrencyContext)

export interface CurrencyProviderProps {
  children: ReactNode
  initialCurrency?: string
  initialRates?: ExchangeRates
}

export function CurrencyProvider({
  children,
  initialCurrency,
  initialRates,
}: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<string>(
    initialCurrency && getSupportedCurrencyCodes().includes(initialCurrency.toUpperCase())
      ? initialCurrency.toUpperCase()
      : BASE_CURRENCY
  )
  const [displayCurrency, setDisplayCurrencyState] = useState<string>(currency)
  const [rates, setRates] = useState<ExchangeRates>(
    initialRates ?? { [BASE_CURRENCY]: 1 }
  )
  const [isLoadingRates, setIsLoadingRates] = useState(!initialRates)

  const setCurrency = useCallback((code: string) => {
    const normalized = code.toUpperCase()
    if (getSupportedCurrencyCodes().includes(normalized)) {
      setCurrencyState(normalized)
      setDisplayCurrencyState(normalized)
      localStorage.setItem("pawvault-currency", normalized)
    }
  }, [])

  const setDisplayCurrency = useCallback((code: string) => {
    const normalized = code.toUpperCase()
    if (getSupportedCurrencyCodes().includes(normalized)) {
      setDisplayCurrencyState(normalized)
      localStorage.setItem("pawvault-display-currency", normalized)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("pawvault-display-currency")
    if (stored && getSupportedCurrencyCodes().includes(stored.toUpperCase())) {
      setDisplayCurrencyState(stored.toUpperCase())
    } else if (initialCurrency) {
      const detected = detectCurrencyFromLocale(initialCurrency)
      if (getSupportedCurrencyCodes().includes(detected)) {
        setCurrencyState(detected)
        setDisplayCurrencyState(detected)
      }
    }
  }, [initialCurrency])

  useEffect(() => {
    let cancelled = false
    fetchExchangeRates().then((newRates) => {
      if (!cancelled) {
        setRates(newRates)
        setIsLoadingRates(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const convertAmount = useCallback(
    (amount: number): number => {
      if (displayCurrency === currency) return amount
      const converted = convertCurrency(amount, currency, displayCurrency, rates)
      return roundCurrency(converted, displayCurrency)
    },
    [currency, displayCurrency, rates],
  )

  const formatAmount = useCallback(
    (amount: number): string => {
      const converted = convertAmount(amount)
      return formatCurrency(converted, displayCurrency)
    },
    [convertAmount, displayCurrency],
  )

  const currencyInfo = getCurrencyInfo(displayCurrency)

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        displayCurrency,
        setDisplayCurrency,
        baseCurrency: currency,
        rates,
        isLoadingRates,
        convertAmount,
        formatAmount,
        currencyInfo,
      }}
    >
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
