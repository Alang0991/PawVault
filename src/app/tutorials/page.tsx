export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Clock, Calendar } from "lucide-react"
import Link from "next/link"

export default async function TutorialsPage() {
  let tutorials: any[] = []
  try {
    tutorials = await prisma.tutorial.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
      take: 100,
    })
  } catch (error) {
    console.error("Failed to fetch tutorials:", error)
  }

  const categories = Array.from(new Set(tutorials.map((t) => t.category)))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tutorials</h1>
        <p className="text-muted-foreground mt-1">
          Guides for creators, buyers, and developers.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="default" size="sm">
            <Link href="/tutorials">All</Link>
          </Button>
          {categories.map((c) => (
            <Button key={c} asChild variant="outline" size="sm">
              <Link href={`/tutorials?category=${c}`}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </Link>
            </Button>
          ))}
        </div>
      )}

      {tutorials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No tutorials published yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {t.category}
                  </Badge>
                  {t.readTime && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {t.readTime} min
                    </span>
                  )}
                </div>
                <CardTitle className="text-base">{t.title}</CardTitle>
                {t.summary && <CardDescription>{t.summary}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {t.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {t.publishedAt && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(t.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Button asChild size="sm" className="mt-3 w-full">
                  <Link href={`/tutorials/${t.slug}`}>Read guide</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}