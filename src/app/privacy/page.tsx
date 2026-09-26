import Link from "next/link"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"
import { t as serverT } from "@/lib/i18n/translation-loader"

export const dynamic = "force-dynamic"

export default async function PrivacyPolicyPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)

  const t = (key: string, params?: Record<string, unknown>) => serverT(translations, key, params)

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">{t("legal.privacy.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("legal.privacy.lastUpdated")}</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.intro.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.privacy.intro.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.informationWeCollect.heading")}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{t("legal.privacy.informationWeCollect.personalData.heading")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("legal.privacy.informationWeCollect.personalData.text")}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t("legal.privacy.informationWeCollect.usageData.heading")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("legal.privacy.informationWeCollect.usageData.text")}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t("legal.privacy.informationWeCollect.transactionData.heading")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("legal.privacy.informationWeCollect.transactionData.text")}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.howWeUse.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("legal.privacy.howWeUse.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(t("legal.privacy.howWeUse.items") as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.dataSharing.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("legal.privacy.dataSharing.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(t("legal.privacy.dataSharing.items") as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.dataSecurity.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.privacy.dataSecurity.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.yourRights.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("legal.privacy.yourRights.intro")}</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              {(t("legal.privacy.yourRights.items") as unknown as string[]).map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.cookies.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.privacy.cookies.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.thirdParty.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.privacy.thirdParty.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.childrensPrivacy.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.privacy.childrensPrivacy.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.changes.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.privacy.changes.text")}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("legal.privacy.contact.heading")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("legal.privacy.contact.text")}</p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">{t("legal.privacy.contact.team")}</p>
              <p className="text-muted-foreground">{t("legal.privacy.contact.email")}</p>
              <p className="text-muted-foreground">{t("legal.privacy.contact.support")} <Link href="/support" className="text-blue-600 hover:underline">{t("support.view")}</Link></p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-blue-600 hover:underline">
            {t("legal.privacy.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}