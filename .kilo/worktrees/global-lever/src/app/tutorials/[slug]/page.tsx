export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"
import { renderMarkdown } from "@/lib/markdown"

export default async function TutorialPage({
  params,
}: {
  params: { slug: string }
}) {
  let tutorial: any = null
  try {
    tutorial = await prisma.tutorial.findUnique({
      where: { slug: params.slug },
      include: {
        author: { select: { username: true, displayName: true } },
      },
    })
  } catch (error) {
    console.error("Failed to fetch tutorial:", error)
  }

  if (!tutorial || !tutorial.isPublished) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm">
        <Link href="/tutorials">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to tutorials
        </Link>
      </Button>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{tutorial.category}</Badge>
          {tutorial.readTime && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {tutorial.readTime} min read
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold">{tutorial.title}</h1>
        {tutorial.summary && (
          <p className="text-lg text-muted-foreground">{tutorial.summary}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {tutorial.author && (
            <span>By {tutorial.author.displayName || tutorial.author.username}</span>
          )}
          {tutorial.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(tutorial.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none py-6">
          {renderMarkdown(tutorial.body)}
        </CardContent>
      </Card>

      {tutorial.tags && tutorial.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tutorial.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}