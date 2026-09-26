import { headers } from "next/headers"
import { getLocaleFromCookie } from "@/lib/i18n/localization"
import { getEnabledLanguageCodes } from "@/lib/i18n/server"

export async function getLocaleFromRequest(): Promise<string> {
  const headersList = headers()
  const cookieHeader = headersList.get("cookie") || ""
  const enabledCodes = await getEnabledLanguageCodes()
  return getLocaleFromCookie(cookieHeader, enabledCodes)
}

export async function loadTranslationsForLocale(locale: string): Promise<any> {
  const { loadTranslations } = await import("@/lib/i18n/translation-loader")
  return loadTranslations(locale)
}