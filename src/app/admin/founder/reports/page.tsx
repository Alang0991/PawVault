import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function FounderReportsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { reporter: { select: { username: true, displayName: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">{reports.length} reports</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <CardTitle>Moderation queue</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reports. PawVault is calm.</p>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{r.reportedType} · {r.reportedId}</p>
                    <p className="text-sm text-muted-foreground">{r.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Reported by {r.reporter.displayName || r.reporter.username} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.status === "PENDING" ? "destructive" : "secondary"}>{r.status}</Badge>
                    {r.status === "PENDING" && (
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
                    )}
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
