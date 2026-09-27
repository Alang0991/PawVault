import type { Metadata } from "next"
import { LegalPage } from "@/components/legal-page"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"
import { t as serverT } from "@/lib/i18n/translation-loader"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Privacy Policy | PawVault",
  description:
    "What personal data PawVault collects, why, and the rights you have over it.",
}

export default async function PrivacyPolicyPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)

  const t = (key: string) => serverT(translations, key)
  const list = (key: string) => (t(key) as unknown as string[]) ?? []

  return (
    <LegalPage
      document={{
        title: t("legal.privacy.title"),
        lastUpdated: t("legal.privacy.lastUpdated"),
        backLabel: t("legal.privacy.backToHome"),
        sections: [
          {
            heading: t("legal.privacy.intro.heading"),
            paragraphs: [t("legal.privacy.intro.text")],
          },
          {
            heading: t("legal.privacy.informationWeCollect.heading"),
            paragraphs: [
              t("legal.privacy.informationWeCollect.personalData.text"),
              t("legal.privacy.informationWeCollect.usageData.text"),
              t("legal.privacy.informationWeCollect.transactionData.text"),
            ],
          },
          {
            heading: t("legal.privacy.howWeUse.heading"),
            paragraphs: [t("legal.privacy.howWeUse.intro")],
            list: list("legal.privacy.howWeUse.items"),
          },
          {
            heading: t("legal.privacy.dataSharing.heading"),
            paragraphs: [t("legal.privacy.dataSharing.intro")],
            list: list("legal.privacy.dataSharing.items"),
          },
          {
            heading: t("legal.privacy.dataSecurity.heading"),
            paragraphs: [t("legal.privacy.dataSecurity.text")],
          },
          {
            heading: t("legal.privacy.yourRights.heading"),
            paragraphs: [t("legal.privacy.yourRights.intro")],
            list: list("legal.privacy.yourRights.items"),
          },
          {
            heading: t("legal.privacy.cookies.heading"),
            paragraphs: [t("legal.privacy.cookies.text")],
          },
          {
            heading: t("legal.privacy.thirdParty.heading"),
            paragraphs: [t("legal.privacy.thirdParty.text")],
          },
          {
            heading: t("legal.privacy.childrensPrivacy.heading"),
            paragraphs: [t("legal.privacy.childrensPrivacy.text")],
          },
          {
            heading: t("legal.privacy.changes.heading"),
            paragraphs: [t("legal.privacy.changes.text")],
          },
          {
            heading: t("legal.privacy.contact.heading"),
            paragraphs: [
              t("legal.privacy.contact.text"),
              `${t("legal.privacy.contact.team")} · ${t("legal.privacy.contact.email")}`,
            ],
          },
        ],
      }}
    />
  )
}
