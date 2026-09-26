"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, User } from "lucide-react"

interface ErrorLog {
  id: string
  severity: string
  message: string
  stack: string | null
  endpoint: string | null
  method: string | null
  statusCode: number | null
  ipAddress: string | null
  resolved: boolean
  resolvedAt: Date | null
  occurredAt: Date
  user: { username: string; displayName: string | null; role: string } | null
}

export function ErrorLogRow({ error, icon: Icon, color }: { error: ErrorLog; icon: any; color: string }) {
  const [resolved, setResolved] = useState(error.resolved)
  const [loading, setLoading] = useState(false)

  async function toggleResolved() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/error-logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorId: error.id, resolved: !resolved }),
      })
      if (res.ok) setResolved(!resolved)
    } catch {
      // swallow
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-b pb-3 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0" />
            <p className="font-medium text-sm truncate">{error.message}</p>
            {error.statusCode && (
              <Badge variant="outline" className="text-xs">
                {error.statusCode}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
            {error.endpoint && (
              <span>
                {error.method && <span className="font-mono">{error.method} </span>}
                {error.endpoint}
              </span>
            )}
            {error.ipAddress && <span>{error.ipAddress}</span>}
            {error.user && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {error.user.displayName || error.user.username}
              </span>
            )}
            <span>
              <Clock className="h-3 w-3 inline mr-1" />
              {new Date(error.occurredAt).toLocaleString()}
            </span>
          </div>
          {error.stack && (
            <details className="mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer">Stack trace</summary>
              <pre className="mt-1 text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={color as any} className="text-xs">
            {error.severity}
          </Badge>
          <Button
            size="sm"
            variant={resolved ? "outline" : "default"}
            className="text-xs"
            onClick={toggleResolved}
            disabled={loading}
          >
            {resolved ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" /> Resolved
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" /> Resolve
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}