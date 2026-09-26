"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Sparkles,
  Bug,
  Rocket,
  Store,
  ShoppingCart,
  Server,
  Code,
  Plus,
} from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface ChangelogEntry {
  id: string
  title: string
  summary: string | null
  description: string | null
  category: string
  releaseDate: string
}

const CATEGORIES = [
  "New",
  "Improved",
  "Fixed",
  "Creator",
  "Marketplace",
  "Platform",
  "API",
]

const CATEGORY_ICONS: Record<string, any> = {
  New: Rocket,
  Improved: Sparkles,
  Fixed: Bug,
  Creator: Store,
  Marketplace: ShoppingCart,
  Platform: Server,
  API: Code,
}

const CATEGORY_COLORS: Record<string, string> = {
  New: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Improved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Fixed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Creator: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Marketplace: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Platform: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  API: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
}

export default function ChangelogPage() {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [entriesRes, userRes] = await Promise.all([
          fetch("/api/changelog"),
          fetch("/api/auth/user"),
        ])
        if (entriesRes.ok) {
          const data = await entriesRes.json()
          setEntries(data.entries || [])
        }
        if (userRes.ok) {
          const userData = await userRes.json()
          setIsStaff(userData.user && ["ADMIN", "FOUNDER", "MODERATOR"].includes(userData.user.role))
        }
      } catch (err) {
        console.error("Failed to load changelog:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grouped = entries.reduce(
    (acc, entry) => {
      const key = entry.releaseDate.split("T")[0]
      if (!acc[key]) acc[key] = []
      acc[key].push(entry)
      return acc
    },
    {} as Record<string, typeof entries>
  )

  const categoryLabels: Record<string, string> = {
    New: t("changelog.categories.new") as string,
    Improved: t("changelog.categories.improved") as string,
    Fixed: t("changelog.categories.fixed") as string,
    Creator: t("changelog.categories.creator") as string,
    Marketplace: t("changelog.categories.marketplace") as string,
    Platform: t("changelog.categories.platform") as string,
    API: t("changelog.categories.api") as string,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="h-24" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{t("changelog.title")}</h1>
              <p className="text-sm text-text-secondary mt-1">{t("changelog.subtitle")}</p>
            </div>
            {isStaff && (
              <Button asChild>
                <Link href="/admin/founder/changelog">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("changelog.newEntry")}
                </Link>
              </Button>
            )}
          </div>

          {entries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="h-10 w-10 mx-auto mb-4 text-text-muted" />
                <p className="text-text-secondary">{t("changelog.empty")}</p>
                {isStaff && (
                  <Button asChild className="mt-4">
                    <Link href="/admin/founder/changelog">
                      {t("changelog.newEntry")}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-10">
              {Object.entries(grouped)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, dayEntries]) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-border" />
                      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                        {new Date(date).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="space-y-4">
                      {dayEntries.map((entry) => {
                        const Icon = CATEGORY_ICONS[entry.category] || Sparkles
                        const colorClass =
                          CATEGORY_COLORS[entry.category] ||
                          "bg-muted text-text-secondary"

                        return (
                          <Card key={entry.id}>
                            <CardHeader>
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${colorClass} shrink-0`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <CardTitle className="text-base">
                                      {entry.title}
                                    </CardTitle>
                                    <Badge variant="outline" className="text-xs">
                                      {categoryLabels[entry.category] || entry.category}
                                    </Badge>
                                  </div>
                                  {entry.summary && (
                                    <p className="text-sm text-text-secondary mt-1">
                                      {entry.summary}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            {entry.description && (
                              <CardContent>
                                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                                  {entry.description}
                                </p>
                              </CardContent>
                            )}
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}