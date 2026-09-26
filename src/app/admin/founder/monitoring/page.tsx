import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Database,
  Globe,
  BarChart3,
  RefreshCw,
  Plus,
} from "lucide-react"
import { MonitoringDashboard } from "@/components/monitoring-dashboard"

export const dynamic = "force-dynamic"

export default async function FounderMonitoringPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoring</h1>
          <p className="text-sm text-muted-foreground">
            System health, alerts, and performance metrics.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/founder">
            ← Back
          </Link>
        </Button>
      </div>

      <MonitoringDashboard />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create alert</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/monitoring" method="POST" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Severity</Label>
                <select name="severity" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="ERROR">Error</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Source (optional)</Label>
                <Input name="source" placeholder="e.g. api, checkout, database" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input name="title" required placeholder="Alert title" />
            </div>
            <div className="space-y-1">
              <Label>Message</Label>
              <Textarea name="message" required placeholder="Describe the issue..." />
            </div>
            <Button type="submit" size="sm">Create alert</Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Metrics are recorded automatically. Alerts require manual creation or external monitoring integration.
      </p>
    </div>
  )
}