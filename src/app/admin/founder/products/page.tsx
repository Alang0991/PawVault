import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import Link from "next/link"
import { Package, Search, Filter } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"
import { ProductSearchForm } from "@/components/product-search-form"

export const dynamic = "force-dynamic"

export default async function FounderProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; featured?: string; creator?: string }
}) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const q = searchParams.q || ""
  const status = searchParams.status || ""
  const featured = searchParams.featured || ""
  const creator = searchParams.creator || ""

  const where: any = {}
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ]
  }
  if (status) {
    where.status = status
  }
  if (featured === "true") {
    where.isFeatured = true
  } else if (featured === "false") {
    where.isFeatured = false
  }
  if (creator) {
    where.creator = { username: { contains: creator, mode: "insensitive" } }
  }

  const [products, creators] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { creator: { select: { username: true, displayName: true } } },
    }),
    prisma.user.findMany({
      where: { role: { in: ["CREATOR", "VERIFIED_CREATOR"] } },
      select: { id: true, username: true, displayName: true },
      orderBy: { displayName: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">{products.length} total products</p>
      </div>

      <ProductSearchForm q={q} status={status} featured={featured} creator={creator} creators={creators} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">All products</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No products match your filters.</p>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="min-w-0">
                    <Link href={`/admin/founder/products/${p.id}`} className="font-medium text-sm hover:underline">
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      by {p.creator?.displayName || p.creator?.username} · {p.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.isFeatured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                    <Badge variant={p.isPublished ? "default" : "secondary"} className="text-xs">
                      {p.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <div className="flex gap-1">
                      <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "publish" }}>Publish</AdminActionButton>
                      <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "unpublish" }}>Unpublish</AdminActionButton>
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