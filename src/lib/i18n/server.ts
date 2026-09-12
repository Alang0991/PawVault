import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { detectBrowserLanguage } from "@/lib/i18n/localization"
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_NAME,
} from "@/lib/i18n/localization"

export async function getUserLocale(): Promise<{
  locale: string
  language: string
  currency: string
  theme: string
  accentColor: string | null
  reduceMotion: boolean
}> {
  const user = await getServerUser()

  if (user) {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        language: true,
        currency: true,
        theme: true,
        accentColor: true,
        reduceMotion: true,
      },
    })

    if (fullUser) {
      return {
        locale: fullUser.language ?? DEFAULT_LANGUAGE,
        language: fullUser.language ?? DEFAULT_LANGUAGE,
        currency: fullUser.currency ?? "USD",
        theme: fullUser.theme ?? "system",
        accentColor: fullUser.accentColor ?? "#8B5CF6",
        reduceMotion: fullUser.reduceMotion ?? false,
      }
    }
  }

  const headersList = headers()
  const acceptLanguage = headersList.get("accept-language") || undefined
  const cookieHeader = headersList.get("cookie") || ""
  const cookieMatch = cookieHeader.match(new RegExp(`${LANGUAGE_COOKIE_NAME}=([^;]+)`))
  const cookieLocale = cookieMatch ? cookieMatch[1] : null

  const detectedLocale = cookieLocale || detectBrowserLanguage(acceptLanguage)

  return {
    locale: detectedLocale,
    language: detectedLocale,
    currency: "USD",
    theme: "system",
    accentColor: null,
    reduceMotion: false,
  }
}

export function getSupportedLocale(locale: string): string {
  const code = locale.split("-")[0].toLowerCase()
  if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
    return code
  }
  return DEFAULT_LANGUAGE
}
