import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { HelpArticleView } from "@/components/help-article"
import { getHelpArticle } from "@/lib/help-center-content"

interface Props {
  params: { slug: string[] }
}

/**
 * Resolves a /help/<path> URL against the published help content first,
 * then falls back to a tutorial of the same slug.
 *
 * The help content used to be shadowed by ~47 placeholder pages that all
 * said "this article is being written". Those are gone, so this route is
 * now the single place that resolves those paths — published help
 * articles win, tutorials still work.
 */
function resolveHelpArticle(path: string) {
  const candidates = [path, path.split("/").pop() ?? path]
  for (const candidate of candidates) {
    const article = getHelpArticle(candidate)
    if (article) return article
  }
  return undefined
}

export async function generateMetadata({ params }: Props) {
  const slug = params.slug.join("/")
  const article = resolveHelpArticle(slug)

  if (article) {
    return {
      title: `${article.title} | PawVault Help Center`,
      description: article.summary,
    }
  }

  const tutorial = await prisma.tutorial.findUnique({
    where: { slug, isPublished: true },
    select: { title: true, summary: true },
  })
  if (!tutorial) return { title: "Not Found | PawVault" }
  return {
    title: `${tutorial.title} | PawVault Help Center`,
    description: tutorial.summary || `Learn how to ${tutorial.title.toLowerCase()}`,
  }
}

export default async function HelpArticlePage({ params }: Props) {
  const slug = params.slug.join("/")

  const article = resolveHelpArticle(slug)
  if (article) return <HelpArticleView article={article} />

  const tutorial = await prisma.tutorial.findUnique({
    where: { slug, isPublished: true },
    include: { author: { select: { displayName: true, username: true, avatar: true } } },
  })

  if (!tutorial) notFound()

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
            <header className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
                {tutorial.title}
              </h1>
              {tutorial.summary && (
                <p className="mt-2 text-lg text-text-secondary">{tutorial.summary}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-muted">
                {tutorial.readTime && <span>{tutorial.readTime} min read</span>}
                {tutorial.publishedAt && (
                  <span>
                    Updated {new Date(tutorial.publishedAt).toLocaleDateString()}
                  </span>
                )}
                {tutorial.author && (
                  <Link
                    href={`/creators/${tutorial.author.username}`}
                    className="underline-offset-4 transition-colors hover:text-text-primary hover:underline"
                  >
                    By {tutorial.author.displayName || tutorial.author.username}
                  </Link>
                )}
              </div>
            </header>

            <div className="whitespace-pre-wrap leading-relaxed text-text-secondary">
              {tutorial.body}
            </div>

            {tutorial.tags && tutorial.tags.length > 0 && (
              <footer className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
                <span className="text-sm text-text-muted">Tags:</span>
                {tutorial.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2 py-1 text-xs text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </footer>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}