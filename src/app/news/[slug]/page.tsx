export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, Folder } from "lucide-react"
import Link from "next/link"
import { renderMarkdown } from "@/lib/markdown"

export default async function NewsDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  let news: any = null
  try {
    news = await prisma.platformNews.findUnique({
      where: { slug: params.slug },
      include: { author: { select: { username: true, displayName: true } } },
    })
  } catch (error) {
    console.error("Failed to fetch news:", error)
  }

  if (!news || !news.isPublished) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm">
        <Link href="/news">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to news
        </Link>
      </Button>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{news.category}</Badge>
          {news.publishedAt && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(news.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold">{news.title}</h1>
        {news.author && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            By {news.author.displayName || news.author.username}
          </p>
        )}
      </div>

      {news.imageUrl && (
        <div className="rounded-lg overflow-hidden border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={news.imageUrl} alt={news.title} className="w-full h-auto" />
        </div>
      )}

      <Card>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none py-6">
          {renderMarkdown(news.body)}
        </CardContent>
      </Card>
    </div>
  )
}