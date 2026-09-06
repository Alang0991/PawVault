import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ScrollText } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AuditLogsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { username: true, displayName: true, email: true, role: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit logs</h1>
        <p className="text-muted-foreground">Every important administrative action is recorded here.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <ScrollText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Recent events ({logs.length})</CardTitle>
              <CardDescription>Sensitive fields like passwords are redacted.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No events yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.user ? (log.user.displayName || log.user.username) : "system"}
                        {log.user?.role && (
                          <Badge variant="outline" className="ml-2">{log.user.role}</Badge>
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
