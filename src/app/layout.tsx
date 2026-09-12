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
import { getUserLocale } from "@/lib/i18n/server"
import { loadTranslations } from "@/lib/i18n/translation-loader"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PawVault - Creator Marketplace for Digital Products",
  description:
    "Discover and buy amazing digital products from talented creators worldwide. 3D models, textures, plugins, and more.",
}

async function getInitialLocale() {
  try {
    const userLocale = await getUserLocale()
    const translations = await loadTranslations(userLocale.locale)
    return {
      locale: userLocale.locale,
      currency: userLocale.currency,
      theme: userLocale.theme,
      translations,
      accentColor: userLocale.accentColor,
      reduceMotion: userLocale.reduceMotion,
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
    }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialLocale = await getInitialLocale()

  return (
    <html lang={initialLocale.locale} className={inter.variable}>
      <head>
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
        <Providers>
          <I18nProvider
            initialLocale={initialLocale.locale}
            initialMessages={initialLocale.translations}
          >
            <CurrencyProvider initialCurrency={initialLocale.currency}>
              <ThemeProvider>
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only absolute z-50 top-4 left-4 bg-accent text-accent-foreground px-4 py-2 rounded-md focus-ring"
                >
                  Skip to main content
                </a>
                <SeasonalEffects />
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
