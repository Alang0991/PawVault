import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag as TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function FounderCategoriesPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">{categories.length} categories</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <TagIcon className="h-5 w-5 text-white" />
            </div>
            <CardTitle>Create category</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/categories" method="POST" className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium">Name</label>
              <Input name="name" required placeholder="Category name" className="w-48" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Slug</label>
              <Input name="slug" required placeholder="category-slug" className="w-40" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Description</label>
              <Input name="description" placeholder="Optional" className="w-48" />
            </div>
            <Button type="submit" size="sm">Create</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <TagIcon className="h-5 w-5 text-white" />
            </div>
            <CardTitle>All categories</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">/{c.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{c._count.products} products</span>
                    <form action={`/api/admin/categories/${c.id}`} method="POST" className="flex gap-1">
                      <input type="hidden" name="_method" value="PUT" />
                      <input type="hidden" name="name" value={c.name} />
                      <input type="hidden" name="slug" value={c.slug} />
                      <Input name="description" defaultValue={c.description ?? ""} placeholder="Description" className="text-xs w-40 h-8" />
                      <Button type="submit" size="sm" variant="outline" className="text-xs">Update</Button>
                    </form>
                    <form action={`/api/admin/categories/${c.id}`} method="POST">
                      <input type="hidden" name="_method" value="DELETE" />
                      <Button type="submit" size="sm" variant="destructive" className="text-xs">Delete</Button>
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
