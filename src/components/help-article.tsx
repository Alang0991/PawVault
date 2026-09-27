import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { HelpArticle } from "@/lib/help-center-content"
import { getRelatedHelpArticles, helpSectionLabels } from "@/lib/help-center-content"

export function HelpArticleView({ article }: { article: HelpArticle }) {
  const related = getRelatedHelpArticles(article.related)

  return (
    <div className="min-h-screen bg-background">
      <div className="pv-shell py-8 md:py-10">
        <div className="max-w-3xl">
          <Link
            href="/help"
            className="-ml-2 mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-text-secondary transition-colors hover:text-text-primary focus-ring"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Help Center
          </Link>

          <article>
            <header className="mb-8 border-b border-border pb-6">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                {helpSectionLabels[article.section]}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
                {article.title}
              </h1>
              <p className="mt-3 text-lg leading-relaxed text-text-secondary">
                {article.summary}
              </p>
              <p className="mt-3 text-sm text-text-muted">
                {article.readTime} min read · Updated {article.updated}
              </p>
            </header>

            {article.sections.map((section, sectionIndex) => (
              <section key={sectionIndex} className="mb-8">
                <h2 className="mb-3 text-xl font-semibold text-text-primary">
                  {section.heading}
                </h2>
                {section.blocks.map((block, blockIndex) => {
                  const key = `${sectionIndex}-${blockIndex}`
                  if (block.type === "paragraph") {
                    return (
                      <p
                        key={key}
                        className="mb-4 leading-relaxed text-text-secondary"
                      >
                        {block.text}
                      </p>
                    )
                  }
                  if (block.type === "callout") {
                    return (
                      <aside
                        key={key}
                        className="mb-4 rounded-lg border border-border bg-surface-subtle p-4 text-sm"
                      >
                        <p className="font-semibold text-text-primary">
                          {block.title}
                        </p>
                        <p className="mt-1 text-text-secondary">{block.text}</p>
                      </aside>
                    )
                  }
                  return (
                    <ul
                      key={key}
                      className={`mb-4 space-y-2 text-text-secondary ${
                        block.ordered
                          ? "list-inside list-decimal"
                          : "list-inside list-disc"
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
              <footer className="mt-8 border-t border-border pt-6">
                <h2 className="mb-3 text-lg font-semibold text-text-primary">
                  Related articles
                </h2>
                <ul className="space-y-1.5">
                  {related.map((relatedArticle) => (
                    <li key={relatedArticle.slug}>
                      <Link
                        href={`/help/articles/${relatedArticle.slug}`}
                        className="rounded text-accent underline-offset-4 hover:underline"
                      >
                        {relatedArticle.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </footer>
            )}
          </article>

          <div className="mt-10 flex flex-wrap items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm text-text-secondary">
            <span>Still stuck?</span>
            <Link
              href="/support"
              className="ml-auto font-medium text-accent underline-offset-4 hover:underline"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
