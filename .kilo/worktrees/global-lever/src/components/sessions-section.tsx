"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/helpers"
import { Loader2, LogOut, Globe } from "lucide-react"

interface Session {
  id: string
  userAgent: string | null
  ipAddress: string | null
  deviceName: string | null
  lastActive: string
  createdAt: string
  expiresAt: string
}

export function SessionsSection() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const res = await fetch("/api/account/sessions")
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId)
    try {
      const res = await fetch("/api/account/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      }
    } catch {
      // error
    } finally {
      setRevoking(null)
    }
  }

  const revokeAllOthers = async (currentId: string) => {
    setRevoking("all")
    try {
      const otherSessions = sessions.filter((s) => s.id !== currentId)
      await Promise.all(
        otherSessions.map((s) =>
          fetch("/api/account/sessions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: s.id }),
          })
        )
      )
      setSessions((prev) => prev.filter((s) => s.id === currentId))
    } catch {
      // error
    } finally {
      setRevoking(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  const currentSessionId = sessions[0]?.id

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Sessions</h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage devices logged into your account
          </p>
        </div>
        {sessions.length > 1 && (
          <Button variant="outline" onClick={() => revokeAllOthers(currentSessionId!)} disabled={revoking === "all"}>
            <LogOut className="h-4 w-4 mr-2" />
            Revoke All Other Sessions
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => {
          const deviceName = session.userAgent || "Unknown Device"
          const isCurrent = index === 0

          return (
            <Card key={session.id} className={isCurrent ? "ring-2 ring-primary/50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl">💻</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{deviceName}</CardTitle>
                        {isCurrent && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted">
                        Last active: {formatDate(session.lastActive)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      <span>{session.ipAddress || "Unknown"}</span>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeSession(session.id)}
                        disabled={revoking === session.id}
                      >
                        {revoking === session.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-1" />
                            Revoke
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-text-muted font-mono">
                  Session created: {formatDate(session.createdAt)} · Expires: {formatDate(session.expiresAt)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}