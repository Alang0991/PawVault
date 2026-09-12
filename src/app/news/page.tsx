export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Folder, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  let news: any[] = []
  let categories: string[] = []
  try {
    const where: any = { isPublished: true }
    if (searchParams.category) where.category = searchParams.category

    news = await prisma.platformNews.findMany({
      where,
      include: { author: { select: { username: true, displayName: true } } },
      orderBy: { publishedAt: "desc" },
      take: 50,
    })

    const all = await prisma.platformNews.findMany({ where: { isPublished: true }, select: { category: true } })
    categories = Array.from(new Set(all.map((n) => n.category)))
  } catch (error) {
    console.error("Failed to fetch news:", error)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform News</h1>
        <p className="text-muted-foreground mt-1">
          Updates, announcements, and stories from the PawVault team.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="default" size="sm">
            <Link href="/news">All</Link>
          </Button>
          {categories.map((c) => (
            <Button key={c} asChild variant="outline" size="sm">
              <Link href={`/news?category=${c}`}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </Link>
            </Button>
          ))}
        </div>
      )}

      {news.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Folder className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No news published yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <Card key={n.id} className="hover:shadow-md transition-all flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {n.category}
                  </Badge>
                  {n.publishedAt && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(n.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <CardTitle className="text-base">{n.title}</CardTitle>
                {n.summary && <CardDescription>{n.summary}</CardDescription>}
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex items-center justify-between">
                  {n.author && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {n.author.displayName || n.author.username}
                    </span>
                  )}
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/news/${n.slug}`}>
                      Read <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}