import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Search, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function FounderAnalyticsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let analytics: any[] = []
  let topQueries: any[] = []
  let totalQueries = 0
  try {
    analytics = await prisma.searchAnalytics.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { username: true, displayName: true } } },
    })
    topQueries = await prisma.searchAnalytics.groupBy({
      by: ["query"],
      _count: { _all: true },
      orderBy: { _count: { query: "desc" } },
      take: 20,
    } as any)
    totalQueries = await prisma.searchAnalytics.count()
  } catch (error) {
    console.error("Failed to fetch search analytics:", error)
  }

  const totalResults = analytics.reduce((sum, a) => sum + a.resultCount, 0)
  const avgResults = analytics.length ? (totalResults / analytics.length).toFixed(1) : "0"
  const zeroResultQueries = analytics.filter((a) => a.resultCount === 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Search analytics</h1>
          <p className="text-sm text-muted-foreground">
            What users are searching for and how well search performs.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/founder">← Back</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Total queries</p>
            <p className="text-xl font-bold">{totalQueries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Avg results</p>
            <p className="text-xl font-bold">{avgResults}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Zero-result</p>
            <p className="text-xl font-bold text-rose-600">{zeroResultQueries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Recent</p>
            <p className="text-xl font-bold">{analytics.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Top search queries</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {topQueries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No search data yet.</p>
          ) : (
            <div className="space-y-2">
              {topQueries.map((q, i) => (
                <div key={q.query} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-muted-foreground w-6">{i + 1}</span>
                    <span className="text-sm font-medium">{q.query}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {q._count._all} searches
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Search className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Recent searches</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {analytics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No search data yet.</p>
          ) : (
            <div className="space-y-2">
              {analytics.map((a) => (
                <div key={a.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.query}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.type} · {a.user?.displayName || a.user?.username || "guest"} ·{" "}
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={a.resultCount === 0 ? "destructive" : "secondary"} className="text-xs">
                    {a.resultCount} results
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}