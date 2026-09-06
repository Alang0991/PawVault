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

export default async function FounderCreatorsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const [creators, applications] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["CREATOR", "VERIFIED_CREATOR"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, username: true, displayName: true, email: true, role: true, isVerified: true, isFeatured: true, createdAt: true },
    }),
    prisma.creatorApplication.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, email: true } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Creators</h1>
        <p className="text-sm text-muted-foreground">{creators.length} creators · {applications.length} pending applications</p>
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
          <CardTitle className="text-base">Pending creator applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending applications.</p>
          ) : (
            <div className="space-y-2">
              {applications.map((a) => (
                <div key={a.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{a.displayName}</p>
                    <p className="text-xs text-muted-foreground">{a.user.email} · @{a.user.username}</p>
                  </div>
                  <div className="flex gap-1">
                    <form action={`/api/admin/creators/application/${a.id}`} method="POST" className="flex gap-1">
                      <input type="hidden" name="action" value="approve" />
                      <Button type="submit" size="sm">Approve</Button>
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
