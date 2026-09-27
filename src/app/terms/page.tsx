import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage } from "@/components/legal-page"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"
import { t as serverT } from "@/lib/i18n/translation-loader"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Terms of Service | PawVault",
  description:
    "The terms that govern the use of PawVault, including creator and customer obligations.",
}

export default async function TermsPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)
  const t = (key: string) => serverT(translations, key)
  const list = (key: string) => (t(key) as unknown as string[]) ?? []

  return (
    <LegalPage
      document={{
        title: t("legal.terms.title"),
        lastUpdated: t("legal.terms.lastUpdated"),
        backLabel: t("legal.terms.backToHome"),
        sections: [
          {
            heading: t("legal.terms.acceptance.heading"),
            paragraphs: [t("legal.terms.acceptance.text")],
          },
          {
            heading: t("legal.terms.description.heading"),
            paragraphs: [t("legal.terms.description.text")],
          },
          {
            heading: t("legal.terms.accountRegistration.heading"),
            paragraphs: [t("legal.terms.accountRegistration.intro")],
            list: list("legal.terms.accountRegistration.items"),
          },
          {
            heading: t("legal.terms.creatorTerms.heading"),
            paragraphs: [
              t("legal.terms.creatorTerms.contentOwnership.text"),
              t("legal.terms.creatorTerms.payouts.text"),
              t("legal.terms.creatorTerms.prohibitedContent.text"),
            ],
          },
          {
            heading: t("legal.terms.customerTerms.heading"),
            paragraphs: [t("legal.terms.customerTerms.text")],
          },
          {
            heading: t("legal.terms.prohibitedActivities.heading"),
            paragraphs: [t("legal.terms.prohibitedActivities.intro")],
            list: list("legal.terms.prohibitedActivities.items"),
          },
          {
            heading: t("legal.terms.refunds.heading"),
            paragraphs: [t("legal.terms.refunds.text")],
          },
          {
            heading: t("legal.terms.intellectualProperty.heading"),
            paragraphs: [t("legal.terms.intellectualProperty.text")],
          },
          {
            heading: t("legal.terms.limitation.heading"),
            paragraphs: [t("legal.terms.limitation.text")],
          },
          {
            heading: t("legal.terms.termination.heading"),
            paragraphs: [t("legal.terms.termination.text")],
          },
          {
            heading: t("legal.terms.governingLaw.heading"),
            paragraphs: [t("legal.terms.governingLaw.text")],
          },
          {
            heading: t("legal.terms.contact.heading"),
            paragraphs: [
              `${t("legal.terms.contact.team")} · ${t("legal.terms.contact.email")}`,
            ],
          },
        ],
      }}
    />
  )
}
