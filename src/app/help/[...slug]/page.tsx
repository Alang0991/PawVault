import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface Props {
  params: { slug: string[] }
}

export async function generateMetadata({ params }: Props) {
  const slug = params.slug.join("/")
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
  const tutorial = await prisma.tutorial.findUnique({
    where: { slug, isPublished: true },
    include: { author: { select: { displayName: true, username: true, avatar: true } } },
  })

  if (!tutorial) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12 max-w-3xl">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Help Center
        </Link>

        <article className="prose prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">{tutorial.title}</h1>
            {tutorial.summary && (
              <p className="text-lg text-text-secondary mb-4">{tutorial.summary}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              {tutorial.readTime && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {tutorial.readTime} min read
                </span>
              )}
              {tutorial.publishedAt && (
                <span>Updated {new Date(tutorial.publishedAt).toLocaleDateString()}</span>
              )}
              {tutorial.author && (
                <Link
                  href={`/creators/${tutorial.author.username}`}
                  className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
                >
                  <span>By {tutorial.author.displayName || tutorial.author.username}</span>
                </Link>
              )}
            </div>
          </header>

          <div className="whitespace-pre-wrap text-text-secondary leading-relaxed">
            {tutorial.body}
          </div>

          {tutorial.tags && tutorial.tags.length > 0 && (
            <footer className="mt-10 pt-6 border-t flex flex-wrap gap-2">
              <span className="text-sm text-text-muted">Tags:</span>
              {tutorial.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 text-xs rounded-full bg-muted text-text-secondary">
                  {tag}
                </span>
              ))}
            </footer>
          )}
        </article>

        <div className="mt-10 pt-6 border-t">
          <Link href="/help" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Help Center
          </Link>
        </div>
      </div>
    </div>
  )
}