import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag as TagIcon } from "lucide-react"
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
                  <p className="text-sm text-muted-foreground">{c._count.products} products</p>
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
