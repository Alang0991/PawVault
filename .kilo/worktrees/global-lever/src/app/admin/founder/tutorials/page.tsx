import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, FileText, Eye, EyeOff, Calendar, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { TutorialRow } from "@/components/tutorial-row"

export const dynamic = "force-dynamic"

export default async function FounderTutorialsPage({
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

  let tutorials: any[] = []
  try {
    tutorials = await prisma.tutorial.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: {
        author: { select: { username: true, displayName: true } },
      },
    })
  } catch (error) {
    console.error("Failed to fetch tutorials:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tutorials</h1>
          <p className="text-sm text-muted-foreground">
            Creator, marketplace, and developer guides.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/founder">← Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create tutorial</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/tutorials" method="POST" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input name="title" required placeholder="e.g. How to upload your first product" />
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input name="slug" required placeholder="how-to-upload-first-product" />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <select name="category" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  <option value="general">General</option>
                  <option value="creator">Creator</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="account">Account</option>
                  <option value="developer">Developer</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Read time (minutes)</Label>
                <Input name="readTime" type="number" min="1" placeholder="e.g. 5" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Summary (optional)</Label>
              <Input name="summary" placeholder="Short description shown in listings" />
            </div>
            <div className="space-y-1">
              <Label>Body</Label>
              <Textarea name="body" required rows={6} placeholder="Tutorial content..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Display order</Label>
                <Input name="displayOrder" type="number" defaultValue="0" />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isPublished" value="true" className="rounded" />
                  Publish
                </label>
              </div>
            </div>
            <Button type="submit" size="sm">
              <FileText className="h-3 w-3 mr-1" /> Create tutorial
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">All tutorials</CardTitle>
              <CardDescription>{tutorials.length} tutorials</CardDescription>
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
                  <Link href={s === "all" ? "/admin/founder/tutorials" : `/admin/founder/tutorials?status=${s}`}>
                    {s === "all" ? "All" : s === "published" ? "Published" : "Draft"}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tutorials.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No tutorials yet.</p>
          ) : (
            <div className="space-y-3">
              {tutorials.map((t) => (
                <TutorialRow key={t.id} tutorial={t} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}