import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { HelpArticleView } from "@/components/help-article"
import {
  getHelpArticle,
  helpSectionLabels,
  publishedHelpArticles,
} from "@/lib/help-center-content"

export const dynamicParams = false

export function generateStaticParams() {
  return publishedHelpArticles
    .filter((article) => Boolean(article && article.slug))
    .map((article) => ({ slug: article.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const article = getHelpArticle(params.slug)
  if (!article) {
    return { title: "Article not found | Help Center" }
  }
  return {
    title: `${article.title} | Help Center`,
    description: article.summary,
    alternates: { canonical: `/help/articles/${article.slug}` },
  }
}

export default function HelpArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const article = getHelpArticle(params.slug)
  if (!article) {
    notFound()
  }
  return <HelpArticleView article={article} />
}
