import Link from "next/link"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"
import { t as serverT } from "@/lib/i18n/translation-loader"

export const dynamic = "force-dynamic"

export default async function CookiePolicyPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)

  const t = (key: string, params?: Record<string, unknown>) => serverT(translations, key, params)

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">{t("legal.cookiePolicy.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("legal.cookiePolicy.lastUpdated") || "Last updated: July 7, 2026"}</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.cookiePolicy.overview.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.cookiePolicy.overview.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.cookiePolicy.related.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.cookiePolicy.related.text")}</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-blue-600 hover:underline">
            {t("legal.cookiePolicy.backToHome") || t("common.back")}
          </Link>
        </div>
      </div>
    </div>
  )
}