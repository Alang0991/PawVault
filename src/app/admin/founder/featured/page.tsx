import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flag } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function FounderFeaturedPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const [products, creators] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { username: true, displayName: true } } },
    }),
    prisma.user.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
      select: { username: true, displayName: true, email: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Featured</h1>
        <p className="text-muted-foreground">{products.length} featured products · {creators.length} featured creators</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <Flag className="h-5 w-5 text-white" />
            </div>
            <CardTitle>Featured products</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No featured products yet.</p>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-muted-foreground">by {p.creator.displayName || p.creator.username}</p>
                  </div>
                  <Badge>Featured</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured creators</CardTitle>
        </CardHeader>
        <CardContent>
          {creators.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No featured creators yet.</p>
          ) : (
            <div className="space-y-2">
              {creators.map((c) => (
                <div key={c.email} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="font-medium">{c.displayName || c.username}</p>
                  <Badge>Featured</Badge>
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
