import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Package } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"

export const dynamic = "force-dynamic"

export default async function FounderProductsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { creator: { select: { username: true, displayName: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">{products.length} total products</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">All products</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No products yet.</p>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{p.title}</p>
                    <p className="text-xs text-muted-foreground">by {p.creator.displayName || p.creator.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.isFeatured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                    <Badge variant={p.isPublished ? "default" : "secondary"} className="text-xs">
                      {p.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <div className="flex gap-1">
                      {p.isPublished ? (
                        <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "unpublish" }} confirm="Unpublish this product?">Unpublish</AdminActionButton>
                      ) : (
                        <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "publish" }}>Publish</AdminActionButton>
                      )}
                      {p.isFeatured ? (
                        <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "unfeature" }} variant="secondary" size="sm">Unfeature</AdminActionButton>
                      ) : (
                        <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "feature" }} variant="secondary" size="sm">Feature</AdminActionButton>
                      )}
                      <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "delete" }} variant="destructive" confirm="Delete this product?">Delete</AdminActionButton>
                    </div>
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