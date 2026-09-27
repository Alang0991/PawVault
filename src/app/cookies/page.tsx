import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"
import { t as serverT } from "@/lib/i18n/translation-loader"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Cookie Policy | PawVault",
  description: "What cookies and local storage PawVault uses, and how to control them.",
}

export default async function CookiePolicyPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)
  const t = (key: string) => serverT(translations, key)

  return (
    <LegalPage
      document={{
        title: t("legal.cookiePolicy.title"),
        lastUpdated: t("legal.cookiePolicy.lastUpdated") || "Last updated: July 7, 2026",
        backLabel: t("legal.cookiePolicy.backToHome") || t("common.back"),
        sections: [
          {
            heading: t("legal.cookiePolicy.overview.heading"),
            paragraphs: [t("legal.cookiePolicy.overview.text")],
          },
          {
            heading: t("legal.cookiePolicy.related.heading"),
            paragraphs: [t("legal.cookiePolicy.related.text")],
          },
        ],
      }}
    />
  )
}
