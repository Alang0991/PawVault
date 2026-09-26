import Link from "next/link"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"
import { t } from "@/lib/i18n/translation-loader"

export const dynamic = "force-dynamic"

export default async function CreatorAgreementPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">{t("legal.creatorAgreement.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("legal.creatorAgreement.lastUpdated")}</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.creatorAgreement.acceptance.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.creatorAgreement.acceptance.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.creatorAgreement.responsibilities.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("legal.creatorAgreement.responsibilities.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(t("legal.creatorAgreement.responsibilities.items") as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.creatorAgreement.contentOwnership.heading")}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{t("legal.creatorAgreement.contentOwnership.ownership.heading")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("legal.creatorAgreement.contentOwnership.ownership.text")}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t("legal.creatorAgreement.contentOwnership.buyerLicenses.heading")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("legal.creatorAgreement.contentOwnership.buyerLicenses.text")}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.creatorAgreement.payouts.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.creatorAgreement.payouts.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.creatorAgreement.prohibitedContent.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("legal.creatorAgreement.prohibitedContent.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(t("legal.creatorAgreement.prohibitedContent.items") as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.creatorAgreement.suspension.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.creatorAgreement.suspension.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.creatorAgreement.disputes.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.creatorAgreement.disputes.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.creatorAgreement.changes.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.creatorAgreement.changes.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.creatorAgreement.contact.heading")}</h2>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">{t("legal.creatorAgreement.contact.team")}</p>
              <p className="text-muted-foreground">{t("legal.creatorAgreement.contact.email")}</p>
              <p className="text-muted-foreground">{t("legal.creatorAgreement.contact.support")} <Link href="/support" className="text-blue-600 hover:underline">{t("support.view")}</Link></p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-blue-600 hover:underline">
            {t("legal.creatorAgreement.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}