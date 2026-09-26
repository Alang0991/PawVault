import Link from "next/link"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"
import { t } from "@/lib/i18n/translation-loader"

export const dynamic = "force-dynamic"

export default async function RefundsPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{t("legal.refunds.title")}</h1>
        <div className="prose dark:prose-invert">
          <p>{t("legal.refunds.lastUpdated")}</p>
          <p>{t("legal.refunds.eligibility.text")}</p>
          <p><strong>{t("legal.refunds.howToRequest.heading")}</strong>: {t("legal.refunds.howToRequest.text")}</p>
          <p><strong>{t("legal.refunds.processing.heading")}</strong>: {t("legal.refunds.processing.text")}</p>
          <p><strong>{t("legal.refunds.exceptions.heading")}</strong>: {t("legal.refunds.exceptions.text")}</p>
          <p>
            <Link href="/" className="text-blue-600 hover:underline">{t("legal.refunds.backToHome")}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}