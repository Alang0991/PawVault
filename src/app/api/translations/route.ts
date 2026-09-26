export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { loadTranslations } from "@/lib/i18n/translation-loader"
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLocaleFromCookie,
} from "@/lib/i18n/localization"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const requestedLocale = url.searchParams.get("locale")

    if (!requestedLocale) {
      return NextResponse.json({
        supportedLanguages: SUPPORTED_LANGUAGES.map((l) => ({
          code: l.code,
          name: l.name,
          nativeName: l.nativeName,
          flag: l.flag,
        })),
        default: DEFAULT_LANGUAGE,
      })
    }

    let locale = requestedLocale
    if (requestedLocale === "auto") {
      const cookieHeader = headers().get("cookie") || ""
      locale = getLocaleFromCookie(cookieHeader)
    }

    const code = locale.split("-")[0].toLowerCase()

    if (!SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
      return NextResponse.json(
        { error: "Unsupported locale" },
        { status: 400 }
      )
    }

    const translations = await loadTranslations(code)

    const language = SUPPORTED_LANGUAGES.find((l) => l.code === code)

    return NextResponse.json(
      { translations, locale: code, language: language?.name },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    )
  } catch (error) {
    console.error("Translation fetch error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
