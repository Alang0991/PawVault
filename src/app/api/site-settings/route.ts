export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SUPPORTED_CURRENCIES, BASE_CURRENCY } from "@/lib/currency"
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/localization"

export async function GET() {
  try {
    const settings: Record<string, string> = {}
    try {
      const siteSettings = await prisma.siteSetting.findMany()
      for (const s of siteSettings) {
        if (shouldExpose(s.key)) {
          settings[s.key] = s.value
        }
      }
    } catch (error) {
      console.error("Failed to fetch site settings:", error)
    }

    const appearance = await prisma.appearanceConfig.findUnique({
      where: { id: "singleton" },
      select: {
        brandName: true,
        logoUrl: true,
        faviconUrl: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        metaTitle: true,
        metaDescription: true,
        maintenanceMode: true,
        maintenanceMessage: true,
      },
    })

    let currencyRates = null
    try {
      currencyRates = await prisma.currencyRate.findMany({
        where: { isEnabled: true },
        orderBy: { code: "asc" },
        select: { code: true, name: true, symbol: true, decimalDigits: true, rateToBase: true },
      })
    } catch (error) {
      console.error("Failed to fetch currency rates:", error)
    }

    const publicSettings = {
      brandName: appearance?.brandName ?? "PawMart",
      logoUrl: appearance?.logoUrl ?? null,
      faviconUrl: appearance?.faviconUrl ?? null,
      primaryColor: appearance?.primaryColor ?? "#8B5CF6",
      secondaryColor: appearance?.secondaryColor ?? "#EC4899",
      maintenanceMode: appearance?.maintenanceMode ?? false,
      maintenanceMessage: appearance?.maintenanceMessage ?? null,
      siteSettings: settings,
      currencies: currencyRates ?? SUPPORTED_CURRENCIES.slice(0, 12),
      baseCurrency: BASE_CURRENCY,
      languages: SUPPORTED_LANGUAGES,
    }

    return NextResponse.json(publicSettings)
  } catch (error) {
    console.error("Get public site settings error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

const PUBLIC_KEYS = new Set([
  "contactEmail",
  "supportUrl",
  "termsUrl",
  "privacyUrl",
  "cookiePolicyUrl",
  "aboutUrl",
  "statusPageUrl",
  "minPayoutAmount",
  "maxFileUploadSize",
])

function shouldExpose(key: string): boolean {
  return PUBLIC_KEYS.has(key)
}
