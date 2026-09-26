import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, Database, Clock, RotateCcw, AlertTriangle, FileDown, CheckCircle } from "lucide-react"
import Link from "next/link"
import { BackupRestoreButton } from "@/components/backup-restore-button"

export const dynamic = "force-dynamic"

export default async function FounderBackupsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let backups: any[] = []
  try {
    backups = await prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        createdBy: { select: { username: true, displayName: true } },
      },
    })
  } catch (error) {
    console.error("Failed to fetch backups:", error)
  }

  const statusConfig: Record<string, { color: any; icon: any; label: string }> = {
    COMPLETED: { color: "default", icon: CheckCircle, label: "Completed" },
    PENDING: { color: "secondary", icon: Clock, label: "Pending" },
    FAILED: { color: "destructive", icon: AlertTriangle, label: "Failed" },
    RESTORING: { color: "default", icon: RotateCcw, label: "Restoring" },
  }

  const typeConfig: Record<string, string> = {
    manual: "Manual",
    scheduled: "Scheduled",
    pre_restore: "Pre-restore",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Backups</h1>
          <p className="text-sm text-muted-foreground">
            Database and configuration backups with founder-only restore.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/founder">← Back</Link>
        </Button>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Founder-only action</AlertTitle>
        <AlertDescription>
          Restore is destructive and requires explicit confirmation. A pre-restore safety backup is always created first.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Database className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create backup</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/backups" method="POST" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1 md:col-span-2">
                <Label>Label</Label>
                <Input name="label" required placeholder="e.g. pre-launch-backup" />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <select name="type" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  <option value="manual">Manual</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="pre_restore">Pre-restore</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Storage</Label>
                <select name="storage" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  <option value="database">Database</option>
                  <option value="files">Files</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Metadata (optional JSON)</Label>
              <Textarea name="metadata" placeholder='{"notes": "..."}' rows={2} />
            </div>
            <Button type="submit" size="sm">
              <FileDown className="h-3 w-3 mr-1" /> Create backup
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Backup history</CardTitle>
              <CardDescription>{backups.length} backups recorded</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No backups yet.</p>
          ) : (
            <div className="space-y-3">
              {backups.map((b) => {
                const sc = statusConfig[b.status] ?? statusConfig.COMPLETED
                const StatusIcon = sc.icon
                return (
                  <div key={b.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{b.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {typeConfig[b.type] ?? b.type} · {b.storage}
                          {b.sizeBytes ? ` · ${(b.sizeBytes / 1024 / 1024).toFixed(1)} MB` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={sc.color} className="text-xs">
                          <StatusIcon className="h-3 w-3 mr-1" /> {sc.label}
                        </Badge>
                        {b.status === "COMPLETED" && (
                          <BackupRestoreButton backupId={b.id} backupLabel={b.label} />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        by {b.createdBy?.displayName || b.createdBy?.username || "system"} ·{" "}
                        {new Date(b.createdAt).toLocaleString()}
                      </p>
                      {b.restoredAt && (
                        <p className="text-xs text-muted-foreground">
                          Restored {new Date(b.restoredAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}