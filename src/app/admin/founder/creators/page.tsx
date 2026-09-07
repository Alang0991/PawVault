import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Crown } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"

export const dynamic = "force-dynamic"

const APPLICATION_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const

export default async function FounderCreatorsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const activeStatus = (searchParams.status || "PENDING") as typeof APPLICATION_STATUSES[number]

  const [creators, applications] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["CREATOR", "VERIFIED_CREATOR"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, username: true, displayName: true, email: true, role: true, isVerified: true, isFeatured: true, createdAt: true },
    }),
    prisma.creatorApplication.findMany({
      where: { status: activeStatus },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, email: true, displayName: true } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Creators</h1>
        <p className="text-sm text-muted-foreground">{creators.length} creators · {applications.length} {activeStatus.toLowerCase()} applications</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Creator accounts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {creators.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No creators yet.</p>
          ) : (
            <div className="space-y-2">
              {creators.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{c.displayName || c.username}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.role === "VERIFIED_CREATOR" ? "default" : "secondary"} className="text-xs">{c.role}</Badge>
                    {c.isFeatured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                    <div className="flex gap-1">
                      {c.isVerified ? (
                        <AdminActionButton url={`/api/admin/creators/${c.id}/verify`} method="POST" body={{ verified: false }} variant="secondary" size="sm">Unverify</AdminActionButton>
                      ) : (
                        <AdminActionButton url={`/api/admin/creators/${c.id}/verify`} method="POST" body={{ verified: true }} size="sm">Verify</AdminActionButton>
                      )}
                      {!c.isFeatured && (
                        <AdminActionButton url={`/api/admin/featured/creator/${c.id}`} method="PATCH" body={{ featured: true }} variant="secondary" size="sm">Feature</AdminActionButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle className="text-base">Creator applications</CardTitle>
            <div className="flex flex-wrap gap-2">
              {APPLICATION_STATUSES.map((status) => (
                <Button
                  key={status}
                  asChild
                  variant={activeStatus === status ? "default" : "secondary"}
                  size="sm"
                >
                  <Link href={`?status=${status}`}>
                    {status.replace("_", " ")}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No {activeStatus.toLowerCase()} applications.</p>
          ) : (
            <div className="space-y-2">
              {applications.map((a) => (
                <div key={a.id} className="flex flex-col gap-3 border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{a.user.displayName || a.user.username}</p>
                      <p className="text-xs text-muted-foreground">{a.user.email} · @{a.user.username}</p>
                      {a.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{a.notes}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">{a.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <form action={`/api/admin/creators/application/${a.id}`} method="POST" className="flex gap-1">
                      <input type="hidden" name="action" value="approve" />
                      <Button type="submit" size="sm">Approve</Button>
                    </form>
                    <form action={`/api/admin/creators/application/${a.id}`} method="POST" className="flex gap-1">
                      <input type="hidden" name="action" value="request_changes" />
                      <input type="hidden" name="notes" value="" />
                      <Button type="submit" size="sm" variant="secondary">Request Changes</Button>
                    </form>
                    <form action={`/api/admin/creators/application/${a.id}`} method="POST" className="flex gap-1">
                      <input type="hidden" name="action" value="under_review" />
                      <Button type="submit" size="sm" variant="outline">Under Review</Button>
                    </form>
                    <form action={`/api/admin/creators/application/${a.id}`} method="POST" className="flex gap-1">
                      <input type="hidden" name="action" value="reject" />
                      <Button type="submit" size="sm" variant="destructive">Reject</Button>
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