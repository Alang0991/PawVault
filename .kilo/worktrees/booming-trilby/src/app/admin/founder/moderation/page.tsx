import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, Users, Star, Shield, AlertTriangle } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"

export const dynamic = "force-dynamic"

export default async function FounderModerationPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const [reports, unpublishedProducts, suspendedUsers, reviews] = await Promise.all([
    prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { reporter: { select: { username: true, displayName: true } } },
    }),
    prisma.product.findMany({
      where: { isPublished: false },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { creator: { select: { username: true, displayName: true } } },
    }),
    prisma.user.findMany({
      where: { status: { in: ["SUSPENDED", "BANNED"] } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, username: true, displayName: true, email: true, status: true },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { product: { select: { title: true } }, user: { select: { username: true, displayName: true } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Moderation Queue</h1>
        <p className="text-sm text-muted-foreground">Unified view of items requiring review</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link href="#reports" className="p-4 rounded-lg border hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-medium">Reports</span>
          </div>
          <p className="text-2xl font-bold">{reports.length}</p>
        </Link>
        <Link href="#products" className="p-4 rounded-lg border hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Products</span>
          </div>
          <p className="text-2xl font-bold">{unpublishedProducts.length}</p>
        </Link>
        <Link href="#users" className="p-4 rounded-lg border hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-sky-500" />
            <span className="text-sm font-medium">Users</span>
          </div>
          <p className="text-2xl font-bold">{suspendedUsers.length}</p>
        </Link>
        <Link href="#reviews" className="p-4 rounded-lg border hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Reviews</span>
          </div>
          <p className="text-2xl font-bold">{reviews.length}</p>
        </Link>
      </div>

      <Card id="reports">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <CardTitle className="text-base">Reports</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No pending reports.</p>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{r.reportedType} · {r.reportedId}</p>
                    <p className="text-xs text-muted-foreground">{r.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Reported by {r.reporter.displayName || r.reporter.username} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <form action={`/api/admin/reports/${r.id}`} method="POST" className="flex gap-1">
                    <select name="action" className="text-xs border rounded px-1 py-1 bg-background">
                      <option value="approve">Approve</option>
                      <option value="remove">Remove</option>
                      <option value="warn">Warn</option>
                      <option value="ban">Ban</option>
                      <option value="investigate">Investigate</option>
                      <option value="dismiss">Dismiss</option>
                    </select>
                    <Button type="submit" size="sm" variant="outline" className="text-xs">Act</Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="products">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">Products awaiting moderation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {unpublishedProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No products awaiting moderation.</p>
          ) : (
            <div className="space-y-2">
              {unpublishedProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{p.title}</p>
                    <p className="text-xs text-muted-foreground">by {p.creator.displayName || p.creator.username} · {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "publish" }} size="sm">Publish</AdminActionButton>
                    <AdminActionButton url={`/api/admin/products/${p.id}`} method="PATCH" body={{ action: "delete" }} variant="destructive" size="sm" confirm="Delete this product?">Delete</AdminActionButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="users">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-sky-500" />
            <CardTitle className="text-base">Suspended / Banned users</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {suspendedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No suspended or banned users.</p>
          ) : (
            <div className="space-y-2">
              {suspendedUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{u.displayName || u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant={u.status === "BANNED" ? "destructive" : "secondary"} className="text-xs">{u.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="reviews">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-base">Recent reviews</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No reviews yet.</p>
          ) : (
            <div className="space-y-2">
              {reviews.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{r.product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.user.displayName || r.user.username} · {r.rating}★
                    </p>
                  </div>
                  <form action={`/api/admin/reviews/${r.id}`} method="POST">
                    <Button type="submit" size="sm" variant="destructive" className="text-xs">Remove</Button>
                  </form>
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
