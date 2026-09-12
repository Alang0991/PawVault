import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Eye, EyeOff, Pencil, Trash2, Code } from "lucide-react"
import Link from "next/link"
import { APIDocRow } from "@/components/api-doc-row"

export const dynamic = "force-dynamic"

export default async function FounderAPIDocsPage({
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

  let docs: any[] = []
  try {
    docs = await prisma.aPIDocument.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: {
        author: { select: { username: true, displayName: true } },
      },
    })
  } catch (error) {
    console.error("Failed to fetch API docs:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API documentation</h1>
          <p className="text-sm text-muted-foreground">
            Public API reference for developers.
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
              <Code className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create API doc</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/api-docs" method="POST" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input name="title" required placeholder="e.g. Create an order" />
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input name="slug" required placeholder="create-order" />
              </div>
              <div className="space-y-1">
                <Label>Endpoint</Label>
                <Input name="endpoint" placeholder="/api/orders" />
              </div>
              <div className="space-y-1">
                <Label>Method</Label>
                <select name="method" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  <option value="">Any</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <select name="category" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  <option value="general">General</option>
                  <option value="auth">Auth</option>
                  <option value="products">Products</option>
                  <option value="orders">Orders</option>
                  <option value="creator">Creator</option>
                  <option value="payments">Payments</option>
                  <option value="webhooks">Webhooks</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Display order</Label>
                <Input name="displayOrder" type="number" defaultValue="0" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Summary (optional)</Label>
              <Input name="summary" placeholder="Short description" />
            </div>
            <div className="space-y-1">
              <Label>Body</Label>
              <Textarea name="body" required rows={6} placeholder="Documentation content..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isPublished" value="true" className="rounded" />
              <Label>Published</Label>
            </div>
            <Button type="submit" size="sm">
              <FileText className="h-3 w-3 mr-1" /> Create doc
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">All API docs</CardTitle>
              <CardDescription>{docs.length} documents</CardDescription>
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
                  <Link href={s === "all" ? "/admin/founder/api-docs" : `/admin/founder/api-docs?status=${s}`}>
                    {s === "all" ? "All" : s === "published" ? "Published" : "Draft"}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No API docs yet.</p>
          ) : (
            <div className="space-y-3">
              {docs.map((d) => (
                <APIDocRow key={d.id} doc={d} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}