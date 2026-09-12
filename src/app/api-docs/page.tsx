export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, BookOpen, Shield } from "lucide-react"
import Link from "next/link"

export default async function APIDocsPage() {
  let docs: any[] = []
  try {
    docs = await prisma.aPIDocument.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
      take: 100,
    })
  } catch (error) {
    console.error("Failed to fetch API docs:", error)
  }

  const categories = Array.from(new Set(docs.map((d) => d.category)))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">API documentation</h1>
        <p className="text-muted-foreground mt-1">
          Reference for the PawVault REST API.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>API keys and session tokens.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Use the <code className="bg-muted px-1 rounded">Authorization</code> header with your API key.</p>
          <p>• API keys are founder-controlled and never exposed to other users.</p>
          <p>• Rate limits apply per key; monitor usage in the Founder Hub.</p>
        </CardContent>
      </Card>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="default" size="sm">
            <Link href="/api-docs">All</Link>
          </Button>
          {categories.map((c) => (
            <Button key={c} asChild variant="outline" size="sm">
              <Link href={`/api-docs?category=${c}`}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </Link>
            </Button>
          ))}
        </div>
      )}

      {docs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Code className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No API documentation published yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {docs.map((d) => (
            <Card key={d.id} className="hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {d.category}
                  </Badge>
                  {d.method && (
                    <Badge variant="outline" className="text-xs font-mono">
                      {d.method}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base">{d.title}</CardTitle>
                {d.endpoint && (
                  <code className="text-xs text-muted-foreground">{d.endpoint}</code>
                )}
                {d.summary && <CardDescription>{d.summary}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {d.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/api-docs/${d.slug}`}>View</Link>
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