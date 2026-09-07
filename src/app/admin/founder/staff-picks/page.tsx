import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Flag, Plus, Trash2, Edit, Eye } from "lucide-react"
import Link from "next/link"
import { AdminActionButton } from "@/components/admin-action-button"
import { StaffPickForm } from "@/components/staff-pick-form"
import Image from "next/image"

export const dynamic = "force-dynamic"

export default async function StaffPicksPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const [picks, products] = await Promise.all([
    prisma.staffPick.findMany({
      include: {
        product: {
          include: {
            creator: { select: { username: true, displayName: true } },
            media: { where: { isThumbnail: true }, take: 1 },
          },
        },
        staff: { select: { username: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Staff Picks</h1>
        <p className="text-sm text-muted-foreground">
          Curated products featured by PawVault staff.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Add Staff Pick</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <StaffPickForm products={products} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Active Staff Picks ({picks.filter((p) => p.isActive).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {picks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No staff picks yet.
            </p>
          ) : (
            <div className="space-y-3">
              {picks.map((pick) => (
                <div
                  key={pick.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded bg-surface-subtle flex items-center justify-center shrink-0">
                      {pick.product.media[0] ? (
                        <Image
                          src={pick.product.media[0].url}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <Star className="h-4 w-4 text-text-muted" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {pick.product.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        by {pick.product.creator.displayName || pick.product.creator.username}
                        {pick.note && ` · ${pick.note}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={pick.isActive ? "success" : "secondary"} size="sm">
                          {pick.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-[10px] text-text-muted">
                          by {pick.staff.displayName || pick.staff.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/product/${pick.product.slug}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <AdminActionButton
                      url={`/api/staff-picks/${pick.id}`}
                      method="PATCH"
                      body={{ isActive: !pick.isActive }}
                      variant="secondary"
                      size="sm"
                    >
                      {pick.isActive ? "Deactivate" : "Activate"}
                    </AdminActionButton>
                    <AdminActionButton
                      url={`/api/staff-picks/${pick.id}`}
                      method="DELETE"
                      body={{}}
                      variant="destructive"
                      size="sm"
                      confirm={`Remove staff pick for "${pick.product.title}"?`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </AdminActionButton>
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