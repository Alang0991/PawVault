import Link from "next/link"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"
import { t } from "@/lib/i18n/translation-loader"

export const dynamic = "force-dynamic"

export default async function MarketplaceGuidelinesPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">{t("legal.marketplaceGuidelines.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("legal.marketplaceGuidelines.lastUpdated")}</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.marketplaceGuidelines.purpose.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.marketplaceGuidelines.purpose.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.marketplaceGuidelines.listingStandards.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("legal.marketplaceGuidelines.listingStandards.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(t("legal.marketplaceGuidelines.listingStandards.items") as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.marketplaceGuidelines.buyerConduct.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("legal.marketplaceGuidelines.buyerConduct.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(t("legal.marketplaceGuidelines.buyerConduct.items") as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.marketplaceGuidelines.prohibited.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("legal.marketplaceGuidelines.prohibited.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(t("legal.marketplaceGuidelines.prohibited.items") as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.marketplaceGuidelines.moderation.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.marketplaceGuidelines.moderation.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.marketplaceGuidelines.disputes.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.marketplaceGuidelines.disputes.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.marketplaceGuidelines.changes.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.marketplaceGuidelines.changes.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.marketplaceGuidelines.contact.heading")}</h2>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">{t("legal.marketplaceGuidelines.contact.team")}</p>
              <p className="text-muted-foreground">{t("legal.marketplaceGuidelines.contact.email")}</p>
              <p className="text-muted-foreground">{t("legal.marketplaceGuidelines.contact.support")} <Link href="/support" className="text-blue-600 hover:underline">{t("support.view")}</Link></p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-blue-600 hover:underline">
            {t("legal.marketplaceGuidelines.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}