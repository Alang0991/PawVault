import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Gavel, Search, Clock, CheckCircle, XCircle } from "lucide-react"

export const dynamic = "force-dynamic"

const STATUSES = ["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED", "UPHELD"] as const

export default async function FounderAppealsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string }
}) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const activeStatus = (searchParams.status || "PENDING") as typeof STATUSES[number]
  const where: any = { status: activeStatus }
  if (searchParams.q) {
    where.OR = [
      { reason: { contains: searchParams.q, mode: "insensitive" } },
      { evidence: { contains: searchParams.q, mode: "insensitive" } },
    ]
  }

  let appeals: any[] = []
  try {
    appeals = await prisma.appeal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { username: true, displayName: true, email: true } },
      },
    })
  } catch (error) {
    console.error("Failed to fetch appeals:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appeals</h1>
        <p className="text-sm text-muted-foreground">
          Review and resolve user appeals against moderation actions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Gavel className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <Label>Search</Label>
              <Input name="q" defaultValue={searchParams.q ?? ""} placeholder="Reason or evidence..." className="w-56" />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select name="status" defaultValue={activeStatus} className="border rounded-md px-2 py-1.5 text-sm bg-background">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm">Apply</Button>
            <Button type="submit" size="sm" variant="outline" asChild>
              <Link href="/admin/founder/appeals">Clear</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Gavel className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">
              {activeStatus.replace("_", " ")} appeals ({appeals.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {appeals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No {activeStatus.replace("_", " ").toLowerCase()} appeals.
            </p>
          ) : (
            <div className="space-y-3">
              {appeals.map((a: any) => (
                <div key={a.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{a.type}</p>
                      <p className="text-xs text-muted-foreground">
                        by {a.user?.displayName || a.user?.username} ({a.user?.email})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{a.status.replace("_", " ")}</Badge>
                      <div className="flex gap-1">
                        <form action="/api/admin/appeals" method="POST" className="flex gap-1">
                          <input type="hidden" name="appealId" value={a.id} />
                          <input type="hidden" name="status" value="RESOLVED" />
                          <Input name="resolution" placeholder="Resolution notes..." className="text-xs w-40 h-7" />
                          <Button type="submit" size="sm" variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />Resolve
                          </Button>
                        </form>
                        <form action="/api/admin/appeals" method="POST" className="flex gap-1">
                          <input type="hidden" name="appealId" value={a.id} />
                          <input type="hidden" name="status" value="DISMISSED" />
                          <Input name="resolution" placeholder="Dismissal notes..." className="text-xs w-40 h-7" />
                          <Button type="submit" size="sm" variant="destructive" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />Dismiss
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mt-2 line-clamp-2">{a.reason}</p>
                  {a.evidence && <p className="text-xs text-muted-foreground mt-1">Evidence: {a.evidence}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
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