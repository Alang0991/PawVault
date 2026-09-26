"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, User, Star } from "lucide-react"

interface Badge {
  id: string
  badgeType: string
  name: string
  description: string | null
  iconUrl: string | null
  earnedAt: Date
  user: { username: string; displayName: string | null; role: string } | null
}

export function BadgeRow({ badge }: { badge: Badge }) {
  const [busy, setBusy] = useState(false)

  async function remove() {
    if (!confirm(`Revoke "${badge.name}" from ${badge.user?.displayName || badge.user?.username}?`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/badges/${badge.id}`, { method: "DELETE" })
      if (res.ok) window.location.reload()
    } catch {
      // swallow
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-b pb-3 last:border-0">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <p className="font-medium text-sm truncate">{badge.name}</p>
            <Badge variant="secondary" className="text-xs">
              {badge.badgeType}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {badge.user?.displayName || badge.user?.username || "unknown"}
            {badge.description ? ` · ${badge.description}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {new Date(badge.earnedAt).toLocaleDateString()}
          </span>
          <Button size="sm" variant="ghost" onClick={remove} disabled={busy}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}