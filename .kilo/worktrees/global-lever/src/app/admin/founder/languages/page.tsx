import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Globe, Languages, Edit2, Trash2 } from "lucide-react"
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/i18n/localization"

export const dynamic = "force-dynamic"

export default async function FounderLanguagesPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let translations: any[] = []
  try {
    translations = await prisma.translationKey.findMany({
      orderBy: [{ locale: "asc" }, { namespace: "asc" }, { key: "asc" }],
      take: 500,
    })
  } catch (error) {
    console.error("Failed to fetch translations:", error)
  }

  const locales = SUPPORTED_LANGUAGES.map((l) => l.code)
  const stats = locales.map((locale) => ({
    locale,
    count: translations.filter((t) => t.locale === locale).length,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Languages</h1>
        <p className="text-sm text-muted-foreground">
          Add languages, edit translations, and manage fallback behaviour.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <CardTitle className="text-base">Language overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const stat = stats.find((s) => s.locale === lang.code)
              return (
                <div key={lang.code} className="p-3 border rounded-lg">
                  <p className="font-medium text-sm">
                    {lang.flag} {lang.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat?.count ?? 0} keys
                    {lang.code === DEFAULT_LANGUAGE && " (default)"}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            <CardTitle className="text-base">Translation management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Edit translations server-side. Changes apply immediately.
          </p>
          <div className="space-y-2">
            {translations.slice(0, 50).map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    [{t.locale}] {t.namespace}:{t.key}
                  </p>
                  <p className="text-sm truncate">{t.value}</p>
                </div>
                <Badge variant="outline" className="text-xs">{t.locale}</Badge>
              </div>
            ))}
          </div>
          {translations.length > 50 && (
            <p className="text-xs text-muted-foreground mt-3">
              Showing first 50 of {translations.length} translations.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fallback settings</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Default language: <b>{DEFAULT_LANGUAGE}</b></p>
          <p>• Missing translations fall back to the default language.</p>
          <p>• Language detection uses browser Accept-Language header.</p>
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}