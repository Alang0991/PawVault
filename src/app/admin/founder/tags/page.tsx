import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Tag as TagIcon, Plus, Trash2, Edit } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function FounderTagsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let tags: any[] = []
  try {
    tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    })
  } catch (error) {
    console.error("Failed to fetch tags:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tags</h1>
        <p className="text-sm text-muted-foreground">{tags.length} tags</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <TagIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create tag</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/tags" method="POST" className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input name="name" required placeholder="Tag name" className="w-40" />
            </div>
            <div className="space-y-1">
              <Label>Slug</Label>
              <Input name="slug" required placeholder="tag-slug" className="w-40" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input name="description" placeholder="Optional" className="w-48" />
            </div>
            <div className="space-y-1">
              <Label>Tag type</Label>
              <Input name="tagType" placeholder="genre, style..." className="w-32" />
            </div>
            <Button type="submit" size="sm">Create</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <TagIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">All tags</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No tags yet.</p>
          ) : (
            <div className="space-y-2">
              {tags.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">/{t.slug}</p>
                    {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t._count.products} products</span>
                    <Badge variant="outline" className="text-xs">{t.tagType ?? "general"}</Badge>
                    <form action={`/api/admin/tags/${t.id}`} method="POST">
                      <input type="hidden" name="_method" value="DELETE" />
                      <Button type="submit" size="sm" variant="destructive" className="text-xs">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}