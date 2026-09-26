"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, FileText, X } from "lucide-react"
import type { HelpArticle } from "@/lib/help-center-content"
import { helpSectionLabels } from "@/lib/help-center-content"
import { useTranslation } from "@/hooks/use-translation"

export function HelpSearch({ articles }: { articles: HelpArticle[] }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return articles.filter((article) => {
      const fields = [
        article.title,
        article.summary,
        ...article.keywords,
        helpSectionLabels[article.section],
      ].join(" ").toLowerCase()
      return fields.includes(term)
    })
  }, [articles, query])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-text-secondary" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={(t("help.searchPlaceholder") as string)}
          className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-2.5 rounded p-1 text-text-secondary hover:text-text-primary"
            aria-label={(t("common.clear") as string)}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {query && (
        <div className="mt-3 max-h-80 overflow-y-auto rounded-lg border bg-popover">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-text-secondary">
              <FileText className="h-4 w-4 inline-block mr-2" />
              {t("help.noResults") as string}
            </div>
          ) : (
            <ul className="py-1">
              {results.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/help/articles/${article.slug}`}
                    className="block px-4 py-2 text-sm hover:bg-accent/50"
                  >
                    <span className="block font-medium text-text-primary">
                      {article.title}
                    </span>
                    <span className="block text-xs text-text-secondary">
                      {helpSectionLabels[article.section]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
