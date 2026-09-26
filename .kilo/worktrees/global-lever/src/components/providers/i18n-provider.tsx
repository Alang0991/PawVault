"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import type { TranslationKeys } from "@/lib/i18n/translations/en"
import { loadTranslations, getCachedTranslations, resolveLocale, interpolate } from "@/lib/i18n/translation-loader"
import type { Language } from "@/lib/i18n/localization"
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_NAME,
} from "@/lib/i18n/localization"
import { getEnabledLanguages } from "@/lib/i18n/localization"

export type { TranslationKeys }

export interface I18nContextValue {
  locale: string
  language: Language
  messages: TranslationKeys
  setLocale: (locale: string) => void
  t: (key: string, params?: Record<string, unknown>) => string
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export interface I18nProviderProps {
  children: ReactNode
  initialLocale?: string
  initialMessages?: TranslationKeys
  enabledLanguages?: string[]
}

export function I18nProvider({
  children,
  initialLocale,
  initialMessages,
  enabledLanguages,
}: I18nProviderProps) {
  const availableLanguages = enabledLanguages
    ? getEnabledLanguages(enabledLanguages)
    : SUPPORTED_LANGUAGES

  const [locale, setLocaleState] = useState<string>(
    initialLocale ? resolveLocale(initialLocale, availableLanguages.map((l) => l.code)) : DEFAULT_LANGUAGE
  )
  const [messages, setMessages] = useState<TranslationKeys>(
    initialMessages ?? getCachedTranslations(locale) ?? ({} as TranslationKeys)
  )

  const t = useCallback(
    (key: string, params?: Record<string, unknown>): string => {
      const parts = key.split(".")
      let value: any = messages

      for (const part of parts) {
        if (value && typeof value === "object" && part in value) {
          value = value[part]
        } else {
          value = undefined
          break
        }
      }

      if (typeof value === "string") {
        return params ? interpolate(value, params) : value
      }

      return key
    },
    [messages],
  )

  const setLocale = useCallback(
    async (newLocale: string) => {
      const code = resolveLocale(newLocale, availableLanguages.map((l) => l.code))
      setLocaleState(code)

      if (!getCachedTranslations(code)) {
        const msgs = await loadTranslations(code)
        setMessages(msgs)
      } else {
        setMessages(getCachedTranslations(code)!)
      }

      if (typeof document !== "undefined") {
        document.cookie = `${LANGUAGE_COOKIE_NAME}=${code}; path=/; max-age=31536000; SameSite=Lax`
        document.documentElement.lang = code
      }
    },
    [availableLanguages],
  )

  useEffect(() => {
    if (!messages || Object.keys(messages).length === 0) {
      loadTranslations(locale).then((msgs) => {
        setMessages(msgs)
      })
    }
  }, [locale, messages])

  const language = availableLanguages.find((l) => l.code === locale) ?? SUPPORTED_LANGUAGES[0]

  return (
    <I18nContext.Provider value={{ locale, language, messages, setLocale, t }}>
      {children}
    </I18nContext.Provider>
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
  return { locale: ctx.locale, language: ctx.language, setLocale: ctx.setLocale }
}
