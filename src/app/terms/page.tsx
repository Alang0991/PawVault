import Link from "next/link"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"
import { t as serverT } from "@/lib/i18n/translation-loader"

export const dynamic = "force-dynamic"

export default async function TermsPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)

  const t = (key: string, params?: Record<string, unknown>) => serverT(translations, key, params)

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">{t("legal.terms.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("legal.terms.lastUpdated")}</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.acceptance.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.terms.acceptance.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.description.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.terms.description.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.accountRegistration.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("legal.terms.accountRegistration.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(t("legal.terms.accountRegistration.items") as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.creatorTerms.heading")}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{t("legal.terms.creatorTerms.contentOwnership.heading")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("legal.terms.creatorTerms.contentOwnership.text")}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t("legal.terms.creatorTerms.payouts.heading")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("legal.terms.creatorTerms.payouts.text")}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t("legal.terms.creatorTerms.prohibitedContent.heading")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("legal.terms.creatorTerms.prohibitedContent.text")}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.customerTerms.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.terms.customerTerms.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.prohibitedActivities.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("legal.terms.prohibitedActivities.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(t("legal.terms.prohibitedActivities.items") as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.refunds.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.terms.refunds.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.intellectualProperty.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.terms.intellectualProperty.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.limitation.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.terms.limitation.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.termination.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.terms.termination.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.governingLaw.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.terms.governingLaw.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.terms.contact.heading")}</h2>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">{t("legal.terms.contact.team")}</p>
              <p className="text-muted-foreground">{t("legal.terms.contact.email")}</p>
              <p className="text-muted-foreground">{t("legal.terms.contact.support")} <Link href="/support" className="text-blue-600 hover:underline">{t("support.view")}</Link></p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-blue-600 hover:underline">
            {t("legal.terms.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}