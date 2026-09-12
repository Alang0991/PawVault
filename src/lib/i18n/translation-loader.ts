import type { TranslationKeys } from "./translations/en"
import { en } from "./translations/en"
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, FALLBACK_LANGUAGE } from "./localization"

type TranslationMap = Record<string, TranslationKeys>

let loadedTranslations: TranslationMap = { en }
let loadingPromises: Record<string, Promise<TranslationKeys>> = {}

const translationModules: Record<string, () => Promise<{ default: TranslationKeys } | TranslationKeys>> = {
  en: () => Promise.resolve({ default: en }),
  es: () => import("./translations/es").then((m) => m.es),
  fr: () => import("./translations/fr").then((m) => m.fr),
  de: () => import("./translations/de").then((m) => m.de),
  pt: () => import("./translations/pt").then((m) => m.pt),
  ja: () => import("./translations/ja").then((m) => m.ja),
  ko: () => import("./translations/ko").then((m) => m.ko),
  zh: () => import("./translations/zh").then((m) => m.zh),
}

export async function loadTranslations(locale: string): Promise<TranslationKeys> {
  const code = locale.split("-")[0].toLowerCase()

  if (code in loadedTranslations) {
    return loadedTranslations[code]
  }

  const loader = translationModules[code] ?? translationModules[DEFAULT_LANGUAGE]
  if (!loader) {
    loadedTranslations[code] = en
    return en
  }

  if (code in loadingPromises) {
    return loadingPromises[code]
  }

  const promise = loader().then((module) => {
    const translations = (module as any).default || (module as any)
    loadedTranslations[code] = translations
    delete loadingPromises[code]
    return translations
  })

  loadingPromises[code] = promise
  return promise
}

export function getCachedTranslations(locale: string): TranslationKeys | undefined {
  const code = locale.split("-")[0].toLowerCase()
  return loadedTranslations[code]
}

export function getSupportedLanguageCodes(): string[] {
  return SUPPORTED_LANGUAGES.map((lang) => lang.code)
}

export function resolveLocale(locale: string | undefined, enabledCodes?: string[]): string {
  if (!locale) return DEFAULT_LANGUAGE

  const code = locale.split("-")[0].toLowerCase()

  const available = enabledCodes
    ? SUPPORTED_LANGUAGES.filter((l) => enabledCodes.includes(l.code))
    : SUPPORTED_LANGUAGES

  if (available.some((l) => l.code === code)) {
    return code
  }

  return available.find((l) => l.code === code)?.code ?? DEFAULT_LANGUAGE
}

export function interpolate(template: string, params: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key]
    if (value === undefined || value === null) return match
    return String(value)
  })
}

export function t(
  translations: TranslationKeys,
  key: string,
  params?: Record<string, unknown>,
): string {
  const parts = key.split(".")
  let value: any = translations

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

  if (key.indexOf(".") > -1) {
    const namespace = parts[0]
    const restKey = parts.slice(1).join(".")
    const fallback = loadedTranslations[FALLBACK_LANGUAGE]
    if (fallback) {
      let fbValue: any = fallback
      for (const part of parts) {
        if (fbValue && typeof fbValue === "object" && part in fbValue) {
          fbValue = fbValue[part]
        } else {
          fbValue = undefined
          break
        }
      }
      if (typeof fbValue === "string") {
        return params ? interpolate(fbValue, params) : fbValue
      }
    }
  }

  return key
}
