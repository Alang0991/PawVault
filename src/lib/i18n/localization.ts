export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  direction: "ltr" | "rtl"
  locale: string
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", direction: "ltr", locale: "en-US" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", direction: "ltr", locale: "es-ES" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", direction: "ltr", locale: "fr-FR" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", direction: "ltr", locale: "de-DE" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", direction: "ltr", locale: "pt-BR" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", direction: "ltr", locale: "ja-JP" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", direction: "ltr", locale: "ko-KR" },
  { code: "zh", name: "Chinese", nativeName: "简体中文", flag: "🇨🇳", direction: "ltr", locale: "zh-CN" },
]

export const DEFAULT_LANGUAGE = "en"
export const FALLBACK_LANGUAGE = "en"

export const LANGUAGE_COOKIE_NAME = "NEXT_LOCALE"
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code)
}

export function getLocaleForLanguage(code: string): string {
  const languageCode = code.split("-")[0].toLowerCase()
  return getLanguageByCode(languageCode)?.locale ?? "en-US"
}

export function getEnabledLanguages(enabledCodes: string[] | undefined): Language[] {
  if (!enabledCodes || enabledCodes.length === 0) {
    return SUPPORTED_LANGUAGES
  }
  return SUPPORTED_LANGUAGES.filter((lang) => enabledCodes.includes(lang.code))
}

export function getLocaleFromCookie(
  cookieHeader: string | null | undefined,
  enabledLanguages: string[] = SUPPORTED_LANGUAGES.map((l) => l.code),
): string {
  if (!cookieHeader) return DEFAULT_LANGUAGE

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LANGUAGE_COOKIE_NAME}=`))

  if (!cookie) return DEFAULT_LANGUAGE

  const rawLocale = cookie.slice(`${LANGUAGE_COOKIE_NAME}=`.length)
  let locale: string
  try {
    locale = decodeURIComponent(rawLocale)
  } catch {
    locale = rawLocale
  }

  const code = locale.split("-")[0].toLowerCase()
  const enabledCodes =
    enabledLanguages.length > 0
      ? enabledLanguages
      : SUPPORTED_LANGUAGES.map((l) => l.code)

  if (
    SUPPORTED_LANGUAGES.some((language) => language.code === code) &&
    enabledCodes.includes(code)
  ) {
    return code
  }

  return DEFAULT_LANGUAGE
}

export function getLocaleCookie(locale: string): string {
  const code = locale.split("-")[0].toLowerCase()
  const supportedCode = SUPPORTED_LANGUAGES.some((language) => language.code === code)
    ? code
    : DEFAULT_LANGUAGE
  return `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(supportedCode)}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; SameSite=Lax`
}

export function detectBrowserLanguage(
  acceptLanguage?: string,
  enabledLanguages: string[] = SUPPORTED_LANGUAGES.map((l) => l.code),
): string {
  if (!acceptLanguage) return DEFAULT_LANGUAGE

  const langs = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=")
      return { tag: tag.trim(), q: q ? parseFloat(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of langs) {
    const code = tag.split("-")[0].toLowerCase()
    if (enabledLanguages.includes(code)) {
      return code
    }
    const fullCode = tag.toLowerCase()
    if (enabledLanguages.includes(fullCode)) {
      return fullCode
    }
  }

  if (enabledLanguages.includes(DEFAULT_LANGUAGE)) {
    return DEFAULT_LANGUAGE
  }
  return enabledLanguages[0] || DEFAULT_LANGUAGE
}
