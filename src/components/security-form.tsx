"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Key, Database, Bell, Globe } from "lucide-react"

interface SecurityFormProps {
  config: any
  tab: string
}

export function SecurityForm({ config, tab }: SecurityFormProps) {
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const form = e.currentTarget as HTMLFormElement
    const fd = new FormData(form)
    const payload: any = {}
    for (const [k, v] of fd.entries()) {
      if (v === "on") payload[k] = true
      else if (v === "off") payload[k] = false
      else payload[k] = v
    }
    try {
      await fetch("/api/admin/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } finally {
      setSaving(false)
    }
  }

  if (tab === "security-login") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <CardTitle className="text-base">Login security</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch name="suspiciousLoginDetection" defaultChecked={true} />
              <Label>Detect suspicious logins</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch name="forcePasswordChange" defaultChecked={false} />
              <Label>Force password change on next login</Label>
            </div>
            <div className="space-y-1">
              <Label>Max login attempts</Label>
              <Input name="maxLoginAttempts" type="number" defaultValue="5" />
            </div>
            <div className="space-y-1">
              <Label>Lockout duration (minutes)</Label>
              <Input name="lockoutDuration" type="number" defaultValue="15" />
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save login settings"}</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (tab === "security-sessions") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <CardTitle className="text-base">Session management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Session timeout (hours)</Label>
              <Input name="sessionTimeout" type="number" defaultValue="24" />
            </div>
            <div className="space-y-1">
              <Label>Max concurrent sessions</Label>
              <Input name="maxConcurrentSessions" type="number" defaultValue="5" />
            </div>
            <div className="flex items-center gap-2">
              <Switch name="forceReauth" defaultChecked={true} />
              <Label>Require re-authentication for sensitive actions</Label>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save session settings"}</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (tab === "security-system") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <CardTitle className="text-base">System controls</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch name="maintenanceMode" defaultChecked={config?.maintenanceMode ?? false} />
              <Label>Maintenance mode</Label>
            </div>
            <div className="space-y-1">
              <Label>Maintenance message</Label>
              <Textarea name="maintenanceMessage" defaultValue={config?.maintenanceMessage ?? ""} />
            </div>
            <div className="flex items-center gap-2">
              <Switch name="siteShutdown" defaultChecked={false} />
              <Label>Emergency site shutdown</Label>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save system settings"}</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (tab === "security-alerts") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <CardTitle className="text-base">Security alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch name="emailSecurityAlerts" defaultChecked={true} />
              <Label>Email on security events</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch name="logAllAdminActions" defaultChecked={true} />
              <Label>Log all admin actions</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch name="auditSensitiveChanges" defaultChecked={true} />
              <Label>Audit sensitive changes</Label>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save alert settings"}</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <CardTitle className="text-base">Backup & restore</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Backup management requires database administrator access.
        </p>
        <div className="flex items-center gap-2">
          <Switch name="autoBackupEnabled" defaultChecked={true} />
          <Label>Enable automatic backups</Label>
        </div>
        <div className="space-y-1">
          <Label>Backup frequency</Label>
          <select name="backupFrequency" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
            <option value="HOURLY">Hourly</option>
            <option value="DAILY" selected>Daily</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Retention period (days)</Label>
          <Input name="retentionDays" type="number" defaultValue="30" />
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save backup settings"}</Button>
      </CardContent>
    </Card>
  )
}