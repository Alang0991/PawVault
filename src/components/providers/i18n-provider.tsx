"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"
import type { TranslationKeys } from "@/lib/i18n/translations/en"
import { en } from "@/lib/i18n/translations/en"
import { formatDate, formatDateTime } from "@/lib/currency"
import {
  loadTranslations,
  getCachedTranslations,
  resolveLocale,
  interpolate,
} from "@/lib/i18n/translation-loader"
import type { Language } from "@/lib/i18n/localization"
import {
  SUPPORTED_LANGUAGES,
  getLocaleCookie,
} from "@/lib/i18n/localization"

export type { TranslationKeys }

export interface I18nContextValue {
  locale: string
  language: Language
  messages: TranslationKeys
  availableLanguages: Language[]
  setLocale: (locale: string) => Promise<void>
  t: (key: string, params?: Record<string, unknown>) => string | string[]
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export interface I18nProviderProps {
  children: ReactNode
  initialLocale?: string
  initialMessages?: TranslationKeys
  enabledLanguages?: string[]
}

function resolveMessages(locale: string, fallback: TranslationKeys): TranslationKeys {
  const cached = getCachedTranslations(locale)
  if (cached && Object.keys(cached).length > 0) {
    return cached
  }
  return fallback
}

export function I18nProvider({
  children,
  initialLocale,
  initialMessages,
  enabledLanguages,
}: I18nProviderProps) {
  const router = useRouter()

  const availableLanguages = enabledLanguages
    ? SUPPORTED_LANGUAGES.filter((l) => enabledLanguages.includes(l.code))
    : SUPPORTED_LANGUAGES

  const availableCodes = availableLanguages.map((l) => l.code)

  const [locale, setLocaleState] = useState<string>(
    resolveLocale(initialLocale, availableCodes),
  )
  const [messages, setMessages] = useState<TranslationKeys>(
    initialMessages ?? resolveMessages(locale, en),
  )

  const t = useCallback(
    (key: string, params?: Record<string, unknown>): string | string[] => {
      const parts = key.split(".")
      let value: unknown = messages

      for (const part of parts) {
        if (value && typeof value === "object" && part in (value as object)) {
          value = (value as Record<string, unknown>)[part]
        } else {
          value = undefined
          break
        }
      }

      if (typeof value === "string") {
        return params ? interpolate(value, params) : value
      }

      if (Array.isArray(value)) {
        return value
      }

      // Missing translation: fall back to the source-of-truth (English) so we
      // never render a raw key or `undefined`.
      let fallback: unknown = en
      for (const part of parts) {
        if (fallback && typeof fallback === "object" && part in (fallback as object)) {
          fallback = (fallback as Record<string, unknown>)[part]
        } else {
          fallback = undefined
          break
        }
      }
      if (typeof fallback === "string") {
        return params ? interpolate(fallback, params) : fallback
      }

      if (Array.isArray(fallback)) {
        return fallback
      }

      return key
    },
    [messages],
  )

  const setLocale = useCallback(
    async (newLocale: string) => {
      const code = resolveLocale(
        newLocale,
        availableLanguages.map((l) => l.code),
      )
      setLocaleState(code)

      if (typeof document !== "undefined") {
        document.cookie = getLocaleCookie(code)
        document.documentElement.lang = code
      }

      try {
        const msgs = await loadTranslations(code)
        setMessages(msgs && Object.keys(msgs).length > 0 ? msgs : en)
      } catch {
        setMessages(en)
      }

      let persisted = false
      const response = await fetch("/api/account/display-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ language: code }),
      }).catch(() => null)
      persisted = Boolean(response && (response.ok || response.status === 401))
      if (response && !response.ok && response.status !== 401) {
        console.warn("PawVault: language preference was not saved", response.status)
      }

      if (persisted) router.refresh()
    },
    [availableLanguages, router],
  )

  useEffect(() => {
    if (!messages || Object.keys(messages).length === 0) {
      loadTranslations(locale)
        .then((msgs) => {
          setMessages(msgs && Object.keys(msgs).length > 0 ? msgs : en)
        })
        .catch(() => {
          setMessages(en)
        })
    }
  }, [locale, messages])

  const language =
    availableLanguages.find((l) => l.code === locale) ?? SUPPORTED_LANGUAGES[0]

  const value: I18nContextValue = {
    locale,
    language,
    messages,
    availableLanguages,
    setLocale,
    t,
  }

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider")
  }
  return ctx
}

export function useLocale() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useLocale must be used within an I18nProvider")
  }
  return {
    locale: ctx.locale,
    language: ctx.language,
    availableLanguages: ctx.availableLanguages,
    setLocale: ctx.setLocale,
  }
}

/**
 * Locale-aware date formatting bound to the active interface language.
 * Use this instead of hardcoding "en-US" / new Intl.DateTimeFormat in components.
 */
export function useFormattedDate() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useFormattedDate must be used within an I18nProvider")
  }
  const targetLocale = ctx.language?.locale || ctx.locale || "en-US"
  return {
    formatDate: (date: Date | string) => formatDate(date, targetLocale),
    formatDateTime: (date: Date | string) => formatDateTime(date, targetLocale),
  }
}
