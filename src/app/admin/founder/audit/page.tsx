import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ScrollText } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function FounderAuditPage({
  searchParams,
}: {
  searchParams: { action?: string; from?: string; to?: string }
}) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const where: any = {}
  if (searchParams.action) {
    where.action = { contains: searchParams.action, mode: "insensitive" as const }
  }
  if (searchParams.from || searchParams.to) {
    where.createdAt = {}
    if (searchParams.from) where.createdAt.gte = new Date(searchParams.from)
    if (searchParams.to) where.createdAt.lte = new Date(searchParams.to)
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { username: true, displayName: true, email: true, role: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit logs</h1>
        <p className="text-sm text-muted-foreground">Every important administrative action is recorded here.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              <div>
                <CardTitle className="text-base">Recent events ({logs.length})</CardTitle>
                <CardDescription>Sensitive fields like passwords are redacted.</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex flex-wrap gap-2 mb-4">
            <Input name="action" placeholder="Filter by action..." defaultValue={searchParams.action ?? ""} className="w-48" />
            <Input name="from" type="date" defaultValue={searchParams.from ?? ""} className="w-40" />
            <Input name="to" type="date" defaultValue={searchParams.to ?? ""} className="w-40" />
            <Button type="submit" size="sm">Filter</Button>
            <Button type="submit" size="sm" variant="outline" asChild>
              <Link href="/admin/founder/audit">Clear</Link>
            </Button>
          </form>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No events yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user ? (log.user.displayName || log.user.username) : "system"}
                        {log.user?.role && (
                          <Badge variant="outline" className="ml-2 text-xs">{log.user.role}</Badge>
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {log.details && (
                    <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                      {(() => {
                        try { return JSON.stringify(JSON.parse(log.details), null, 2) } catch { return log.details }
                      })()}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back to overview</Link>
    </div>
  )
}
