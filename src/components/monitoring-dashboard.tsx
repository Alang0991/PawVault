"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, Server, Database, Globe } from "lucide-react"

interface Alert {
  id: string
  severity: string
  title: string
  message: string
  source: string | null
  acknowledged: boolean
  createdAt: string
}

interface Metrics {
  [key: string]: Array<{ value: number; unit: string | null; recordedAt: string }>
}

export function MonitoringDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [metrics, setMetrics] = useState<Metrics>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/monitoring")
      if (!res.ok) throw new Error("Failed to load monitoring data")
      const data = await res.json()
      setAlerts(data.activeAlerts ?? [])
      setMetrics(data.metricsByType ?? {})
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const severityConfig: Record<string, { color: string; icon: any }> = {
    CRITICAL: { color: "destructive", icon: XCircle },
    ERROR: { color: "destructive", icon: XCircle },
    WARNING: { color: "default", icon: AlertTriangle },
    INFO: { color: "secondary", icon: CheckCircle },
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading monitoring data...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">System Health</h2>
        <Button size="sm" variant="outline" onClick={load}>
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Active alerts</p>
            <p className="text-xl font-bold">{alerts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Critical</p>
            <p className="text-xl font-bold text-red-600">
              {alerts.filter((a) => a.severity === "CRITICAL").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Warnings</p>
            <p className="text-xl font-bold text-yellow-600">
              {alerts.filter((a) => a.severity === "WARNING").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase">Metric types</p>
            <p className="text-xl font-bold">{Object.keys(metrics).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">No active alerts. System is healthy.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const cfg = severityConfig[alert.severity] ?? severityConfig.INFO
                const Icon = cfg.icon
                return (
                  <Alert key={alert.id} variant={cfg.color as any}>
                    <Icon className="h-4 w-4" />
                    <AlertTitle className="text-sm">
                      {alert.title}
                      {alert.source && <span className="text-xs text-muted-foreground ml-2">({alert.source})</span>}
                    </AlertTitle>
                    <AlertDescription className="text-xs">
                      {alert.message}
                      <span className="ml-2 text-muted-foreground">
                        <Clock className="h-3 w-3 inline" /> {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </AlertDescription>
                  </Alert>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(metrics).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No metrics recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(metrics).map(([type, data]) => (
                <div key={type}>
                  <p className="text-sm font-medium mb-1">{type}</p>
                  <div className="space-y-1">
                    {data.slice(0, 5).map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {new Date(m.recordedAt).toLocaleTimeString()}
                        </span>
                        <span>
                          {m.value}{m.unit ? ` ${m.unit}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}