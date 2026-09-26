export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { getLocaleFromRequest, loadTranslationsForLocale } from "@/lib/i18n/server-locale"

export default async function TutorialsPage() {
  const locale = await getLocaleFromRequest()
  const translations = await loadTranslationsForLocale(locale)

  const t = (key: string) => {
    const parts = key.split(".")
    let value: any = translations
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part]
      } else {
        return key
      }
    }
    return typeof value === "string" ? value : key
  }

  let tutorials: any[] = []
  try {
    tutorials = await prisma.tutorial.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
      take: 100,
    })
  } catch (error) {
    console.error("Failed to fetch tutorials:", error)
  }

  const categories = Array.from(new Set(tutorials.map((t) => t.category)))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("navigation.tutorials") || "Tutorials"}</h1>
        <p className="text-muted-foreground mt-1">
          {t("tutorials.description") || "Guides for creators, buyers, and developers."}
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="default" size="sm">
            <Link href="/tutorials">{t("common.all") || "All"}</Link>
          </Button>
          {categories.map((c) => (
            <Button key={c} asChild variant="outline" size="sm">
              <Link href={`/tutorials?category=${c}`}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </Link>
            </Button>
          ))}
        </div>
      )}

      {tutorials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">{t("tutorials.noTutorials") || "No tutorials published yet."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((tut) => (
            <Card key={tut.id} className="hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {tut.category}
                  </Badge>
                  {tut.readTime && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {tut.readTime} {t("common.min") || "min"}
                    </span>
                  )}
                </div>
                <CardTitle className="text-base">{tut.title}</CardTitle>
                {tut.summary && <CardDescription>{tut.summary}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {tut.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {tut.publishedAt && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(tut.publishedAt).toLocaleDateString(locale)}
                    </span>
                  )}
                </div>
                <Button asChild size="sm" className="mt-3 w-full">
                  <Link href={`/tutorials/${tut.slug}`}>{t("common.readGuide") || "Read guide"}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}