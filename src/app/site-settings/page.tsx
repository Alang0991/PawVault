import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Info,
  Tag,
  Shield,
  FileText,
  HelpCircle,
  ExternalLink,
  DollarSign,
  Globe,
  Lock,
  Heart,
} from "lucide-react"

export const dynamic = "force-dynamic"

async function getPublicSettings() {
  try {
    return await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/site-settings`).then((r) => r.json())
  } catch {
    const appearance = await prisma.appearanceConfig.findUnique({
      where: { id: "singleton" },
      select: {
        brandName: true,
        primaryColor: true,
        secondaryColor: true,
        maintenanceMode: true,
        maintenanceMessage: true,
      },
    }).catch(() => null)

    return {
      brandName: appearance?.brandName ?? "PawMart",
      primaryColor: appearance?.primaryColor ?? "#8B5CF6",
      secondaryColor: appearance?.secondaryColor ?? "#EC4899",
      maintenanceMode: appearance?.maintenanceMode ?? false,
      maintenanceMessage: appearance?.maintenanceMessage ?? null,
      siteSettings: {},
      currencies: [],
      baseCurrency: "USD",
      languages: [],
    }
  }
}

export default async function SiteSettingsPage() {
  const settings = await getPublicSettings()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
          <p className="text-text-secondary">
            Public platform configuration and operational details.
          </p>
        </div>

        {settings.maintenanceMode && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Info className="h-4 w-4" />
                <p className="font-medium">
                  {settings.maintenanceMessage || "The site is currently under maintenance."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" /> Brand
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Platform name</span>
                <p className="font-medium">{settings.brandName}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Primary color</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="h-4 w-4 rounded border"
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                  <code className="text-xs text-muted-foreground">{settings.primaryColor}</code>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Secondary color</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="h-4 w-4 rounded border"
                    style={{ backgroundColor: settings.secondaryColor }}
                  />
                  <code className="text-xs text-muted-foreground">{settings.secondaryColor}</code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" /> Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Base currency</span>
                <p className="font-medium">{settings.baseCurrency}</p>
              </div>
              {settings.currencies && settings.currencies.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Supported currencies</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {settings.currencies.slice(0, 15).map((c: any) => (
                      <Badge key={c.code} variant="secondary" className="text-xs">
                        {c.code}
                      </Badge>
                    ))}
                    {settings.currencies.length > 15 && (
                      <Badge variant="secondary" className="text-xs">
                        +{settings.currencies.length - 15} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {settings.languages && settings.languages.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Supported languages</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {settings.languages.map((l: any) => (
                      <Badge key={l.code} variant="secondary" className="text-xs">
                        {l.code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {settings.siteSettings && Object.keys(settings.siteSettings).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" /> Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(settings.siteSettings).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{key}</span>
                    <span className="text-sm">{String(value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4" /> Legal & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/terms" className="underline-offset-4 hover:underline flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Terms of Service
                </Link>
                <Link href="/privacy" className="underline-offset-4 hover:underline flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Privacy Policy
                </Link>
                <Link href="/refund-policy" className="underline-offset-4 hover:underline flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Refund Policy
                </Link>
                <Link href="/license-agreement" className="underline-offset-4 hover:underline flex items-center gap-1">
                  <Shield className="h-3 w-3" /> License Agreement
                </Link>
                <Link href="/help" className="underline-offset-4 hover:underline flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" /> Help Center
                </Link>
                <Link href="/support" className="underline-offset-4 hover:underline flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Contact Support
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                For platform fees and payout schedules, see the{" "}
                <Link href="/refund-policy" className="underline">Refund Policy</Link>{" "}
                and{" "}
                <Link href="/help" className="underline">Help Center</Link>.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 pt-4 border-t">
          <Link href="/" className="text-sm underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
