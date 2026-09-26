import Link from "next/link"
import { ArrowLeft, Clock, CalendarDays, LifeBuoy, Dot } from "lucide-react"
import type { HelpArticle } from "@/lib/help-center-content"
import { helpSectionLabels } from "@/lib/help-center-content"
import { getPublishedHelpArticle } from "@/lib/help-center-content"

export function HelpArticleView({ article }: { article: HelpArticle }) {
  const related = (article.related || [])
    .map((id) => getPublishedHelpArticle(id))
    .filter((item): item is HelpArticle => item !== undefined)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12 max-w-3xl">
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Help Center
        </Link>

        <article>
          <header className="mb-8">
            <nav
              aria-label="Help section"
              className="text-xs text-text-secondary uppercase tracking-wider mb-3"
            >
              {helpSectionLabels[article.section]}
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-text-secondary mb-4">{article.summary}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime} min read
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Updated {article.updated}
              </span>
              <span className="inline-flex items-center gap-1">
                <Dot className="h-4 w-4 text-green-500" />
                {article.status}
              </span>
            </div>
          </header>

          {article.sections.map((section, sectionIndex) => (
            <section key={sectionIndex} className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {section.heading}
              </h2>
              {section.blocks.map((block, blockIndex) => {
                const key = `${sectionIndex}-${blockIndex}`
                if (block.type === "paragraph") {
                  return (
                    <p
                      key={key}
                      className="text-text-secondary mb-4 leading-relaxed"
                    >
                      {block.text}
                    </p>
                  )
                }
                if (block.type === "callout") {
                  return (
                    <div
                      key={key}
                      className="mb-4 rounded-lg border bg-accent/50 p-4 text-sm"
                    >
                      <p className="font-semibold text-text-primary">
                        {block.title}
                      </p>
                      <p className="mt-1 text-text-secondary">
                        {block.text}
                      </p>
                    </div>
                  )
                }
                return (
                  <ul
                    key={key}
                    className={`text-text-secondary mb-4 space-y-2 ${
                      block.ordered
                        ? "list-decimal list-inside"
                        : "list-disc list-inside"
                    }`}
                  >
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )
              })}
            </section>
          ))}

          {related.length > 0 && (
            <footer className="border-t pt-8 mt-8">
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                Related articles
              </h2>
              <ul className="space-y-2">
                {related.map((relatedArticle) => (
                  <li key={relatedArticle.slug}>
                    <Link
                      href={`/help/articles/${relatedArticle.slug}`}
                      className="text-accent hover:underline"
                    >
                      {relatedArticle.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </footer>
          )}

          <div className="mt-10 flex items-center gap-2 rounded-lg border bg-accent/30 px-4 py-3 text-text-secondary">
            <LifeBuoy className="h-4 w-4" />
            <span>Still need help?</span>
            <Link
              href="/support"
              className="ml-auto text-accent font-medium hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
