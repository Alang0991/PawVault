import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Providers } from "./providers"
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/theme-provider"
import { I18nProvider } from "@/components/providers/i18n-provider"
import { CurrencyProvider } from "@/components/providers/currency-provider"
import { SeasonalEffects } from "@/components/seasonal-effects"
import { getUserLocale, getEnabledLanguageCodes } from "@/lib/i18n/server"
import { getServerAuthSession } from "@/lib/session"
import { loadTranslations } from "@/lib/i18n/translation-loader"
import { en } from "@/lib/i18n/translations/en"
import { getActiveSeasonalThemeFromDb } from "@/lib/seasonal-themes-server"
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/localization"
import type { SeasonalThemeConfig } from "@/lib/seasonal-themes"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  icons: {
    icon: "/icons/IMG_1275.png",
    shortcut: "/icons/IMG_1275.png",
    apple: "/icons/IMG_1275.png",
  },
}

async function getInitialLocale() {
  try {
    const userLocale = await getUserLocale()
    const enabledLanguages = await getEnabledLanguageCodes()
    const translations = await loadTranslations(userLocale.locale)
    return {
      locale: userLocale.locale,
      currency: userLocale.currency,
      theme: userLocale.theme,
      translations,
      accentColor: userLocale.accentColor,
      reduceMotion: userLocale.reduceMotion,
      currencyRates: userLocale.currencyRates,
      ratesUpdatedAt: userLocale.ratesUpdatedAt,
      ratesSource: userLocale.ratesSource,
      enabledLanguages,
    }
  } catch {
    const translations = await loadTranslations("en")
    return {
      locale: "en",
      currency: "USD",
      theme: "system",
      translations,
      accentColor: null,
      reduceMotion: false,
      currencyRates: { USD: 1 },
      ratesUpdatedAt: null,
      ratesSource: "default",
      enabledLanguages: SUPPORTED_LANGUAGES.map((language) => language.code),
    }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialLocale = await getInitialLocale()
  const session = await getServerAuthSession()
  let initialSeasonalTheme: SeasonalThemeConfig | null = null
  try {
    initialSeasonalTheme = await getActiveSeasonalThemeFromDb()
  } catch {
    // fall through to null
  }

  const skipToContent = initialLocale.translations.site?.skipToContent ?? en.site.skipToContent

  return (
    <html lang={initialLocale.locale} className={inter.variable}>
      <head>
        <title>{initialLocale.translations.site?.title ?? en.site.title}</title>
        <meta
          name="description"
          content={initialLocale.translations.site?.description ?? en.site.description}
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {initialLocale.accentColor && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(){try{
                  var accent="${initialLocale.accentColor}";
                  var r=parseInt(accent.substr(1,2),16),g=parseInt(accent.substr(3,2),16),b=parseInt(accent.substr(5,2),16);
                  var max=Math.max(r,g,b),min=Math.min(r,g,b);
                  var h,s,l=(max+min)/2;
                  var d=max-min;
                  if(d===0){h=0;s=0}else{s=l>0.5?d/(2-(max+min)):d/(max+min);h=d===0?0:((max===r?((g-b)/d)%6:(max===g?2+(b-r)/d:4+(r-g)/d))*60+360)%360;}
                  var hsl=h+" "+Math.round(s*100)+"% "+Math.round(l*100)+"%";
                  document.documentElement.style.setProperty('--pv-accent-override',hsl);
                  document.documentElement.style.setProperty('--accent',hsl);
                  document.documentElement.style.setProperty('--ring',hsl);
                  document.documentElement.style.setProperty('--primary',hsl);
                }catch(e){}})();
              `,
            }}
          />
        )}
        {initialLocale.reduceMotion && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){document.documentElement.classList.add('reduce-motion');})()`,
            }}
          />
        )}
      </head>
      <body className="font-sans">
        <Providers session={session}>
          <I18nProvider
            initialLocale={initialLocale.locale}
            initialMessages={initialLocale.translations}
            enabledLanguages={initialLocale.enabledLanguages}
          >
            <CurrencyProvider
              initialCurrency={initialLocale.currency}
              initialRates={initialLocale.currencyRates}
              initialRatesUpdatedAt={initialLocale.ratesUpdatedAt}
              initialRatesSource={initialLocale.ratesSource}
            >
              <ThemeProvider
                initialTheme={initialLocale.theme as any}
                initialAccentColor={initialLocale.accentColor}
                initialReduceMotion={initialLocale.reduceMotion}
              >
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only absolute z-50 top-4 left-4 bg-accent text-accent-foreground px-4 py-2 rounded-md focus-ring"
                >
                  {skipToContent}
                </a>
                <SeasonalEffects serverTheme={initialSeasonalTheme} />
                <Header />
                <main id="main-content" className="min-h-screen">
                  {children}
                </main>
                <Footer />
              </ThemeProvider>
            </CurrencyProvider>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  )
}
