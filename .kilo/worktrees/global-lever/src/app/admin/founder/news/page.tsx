import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Eye, EyeOff, Calendar, Folder } from "lucide-react"
import Link from "next/link"
import { NewsRow } from "@/components/news-row"

export const dynamic = "force-dynamic"

export default async function FounderNewsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const status = searchParams.status || "all"
  const where: any = {}
  if (status === "published") where.isPublished = true
  else if (status === "draft") where.isPublished = false

  let news: any[] = []
  try {
    news = await prisma.platformNews.findMany({
      where,
      include: { author: { select: { username: true, displayName: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
  } catch (error) {
    console.error("Failed to fetch news:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform news</h1>
          <p className="text-sm text-muted-foreground">Blog and platform updates.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/founder">← Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create news post</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/news" method="POST" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input name="title" required placeholder="e.g. New creator dashboard" />
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input name="slug" required placeholder="new-creator-dashboard" />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <select name="category" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  <option value="general">General</option>
                  <option value="product">Products</option>
                  <option value="creator">Creator</option>
                  <option value="platform">Platform</option>
                  <option value="update">Updates</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Image URL (optional)</Label>
                <Input name="imageUrl" placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Summary (optional)</Label>
              <Input name="summary" placeholder="Short description" />
            </div>
            <div className="space-y-1">
              <Label>Body</Label>
              <Textarea name="body" required rows={6} placeholder="News content..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isPublished" value="true" className="rounded" />
              <Label>Publish</Label>
            </div>
            <Button type="submit" size="sm">
              <FileText className="h-3 w-3 mr-1" /> Create post
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">All news posts</CardTitle>
              <CardDescription>{news.length} posts</CardDescription>
            </div>
            <div className="flex gap-1">
              {["all", "published", "draft"].map((s) => (
                <Button
                  key={s}
                  asChild
                  size="sm"
                  variant={status === s ? "default" : "ghost"}
                  className="text-xs"
                >
                  <Link href={s === "all" ? "/admin/founder/news" : `/admin/founder/news?status=${s}`}>
                    {s === "all" ? "All" : s === "published" ? "Published" : "Draft"}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No news posts yet.</p>
          ) : (
            <div className="space-y-3">
              {news.map((n) => (
                <NewsRow key={n.id} news={n} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}