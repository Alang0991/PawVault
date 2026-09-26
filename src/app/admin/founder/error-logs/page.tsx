import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollText, AlertTriangle, XCircle, CheckCircle, Filter, Clock } from "lucide-react"
import Link from "next/link"
import { ErrorLogRow } from "@/components/error-log-row"

export const dynamic = "force-dynamic"

export default async function FounderErrorLogsPage({
  searchParams,
}: {
  searchParams: { severity?: string; resolved?: string; endpoint?: string }
}) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const where: any = {}
  if (searchParams.severity) where.severity = searchParams.severity
  if (searchParams.resolved === "true") where.resolved = true
  else if (searchParams.resolved === "false") where.resolved = false
  if (searchParams.endpoint) where.endpoint = { contains: searchParams.endpoint, mode: "insensitive" }

  let errors: any[] = []
  let counts: any[] = []
  try {
    errors = await prisma.errorLog.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: 200,
      include: {
        user: { select: { username: true, displayName: true, role: true } },
      },
    })
    counts = await prisma.errorLog.groupBy({
      by: ["severity", "resolved"],
      _count: { _all: true },
    } as any)
  } catch (error) {
    console.error("Failed to fetch error logs:", error)
  }

  const unresolved = errors.filter((e) => !e.resolved).length
  const fatal = errors.filter((e) => e.severity === "FATAL").length
  const errorCount = errors.filter((e) => e.severity === "ERROR").length
  const warningCount = errors.filter((e) => e.severity === "WARNING").length

  const severityConfig: Record<string, { color: any; icon: any }> = {
    FATAL: { color: "destructive", icon: XCircle },
    ERROR: { color: "destructive", icon: AlertTriangle },
    WARNING: { color: "default", icon: AlertTriangle },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Error monitoring</h1>
          <p className="text-sm text-muted-foreground">
            Application errors, API failures, and performance problems.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/founder">← Back</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Total (shown)</p>
            <p className="text-xl font-bold">{errors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Unresolved</p>
            <p className="text-xl font-bold text-rose-600">{unresolved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Fatal</p>
            <p className="text-xl font-bold text-rose-600">{fatal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Warnings</p>
            <p className="text-xl font-bold text-yellow-600">{warningCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex flex-wrap gap-2">
            <Input
              name="endpoint"
              placeholder="Filter by endpoint..."
              defaultValue={searchParams.endpoint ?? ""}
              className="w-56"
            />
            <select
              name="severity"
              defaultValue={searchParams.severity ?? ""}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All severities</option>
              <option value="FATAL">Fatal</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
            </select>
            <select
              name="resolved"
              defaultValue={searchParams.resolved ?? ""}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="false">Unresolved</option>
              <option value="true">Resolved</option>
            </select>
            <Button type="submit" size="sm">Filter</Button>
            <Button type="submit" size="sm" variant="outline" asChild>
              <Link href="/admin/founder/error-logs">Clear</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Error log</CardTitle>
              <CardDescription>{errors.length} entries</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {errors.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">No errors match the current filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((e) => {
                const cfg = severityConfig[e.severity] ?? severityConfig.ERROR
                const Icon = cfg.icon
                return (
                  <ErrorLogRow key={e.id} error={e} icon={Icon} color={cfg.color} />
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}