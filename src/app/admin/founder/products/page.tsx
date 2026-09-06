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
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">{products.length} total products</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <CardTitle>All products</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No products yet. More drops are on the way.
            </p>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-muted-foreground">by {p.creator.displayName || p.creator.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.isFeatured && <Badge>Featured</Badge>}
                    <Badge variant={p.isPublished ? "default" : "secondary"}>
                      {p.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <div className="flex gap-1">
                      {p.isPublished ? (
                        <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "unpublish" }} confirm="Unpublish this product?">Unpublish</AdminActionButton>
                      ) : (
                        <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "publish" }}>Publish</AdminActionButton>
                      )}
                      {p.isFeatured ? (
                        <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "unfeature" }} variant="secondary">Unfeature</AdminActionButton>
                      ) : (
                        <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "feature" }} variant="secondary">Feature</AdminActionButton>
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
