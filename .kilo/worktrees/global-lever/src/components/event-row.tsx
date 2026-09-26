"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Pencil, Trash2, Calendar, Clock } from "lucide-react"
import Link from "next/link"

interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  startDate: Date
  endDate: Date | null
  location: string | null
  isPublished: boolean
  createdAt: Date
  creator: { username: string; displayName: string | null } | null
}

export function EventRow({ event }: { event: Event }) {
  const [busy, setBusy] = useState(false)

  async function togglePublished() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !event.isPublished }),
      })
      if (res.ok) window.location.reload()
    } catch {
      // swallow
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm(`Delete "${event.title}"?`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" })
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
          <p className="font-medium text-sm truncate">{event.title}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(event.startDate).toLocaleString()}
            {event.creator ? ` · by ${event.creator.displayName || event.creator.username}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={event.isPublished ? "default" : "secondary"} className="text-xs">
            {event.isPublished ? "Published" : "Draft"}
          </Badge>
          <Button size="sm" variant="outline" asChild>
            <Link href={event.isPublished ? `/events/${event.slug}` : "#"}>
              <Pencil className="h-3 w-3" />
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={togglePublished} disabled={busy}>
            {event.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={remove} disabled={busy}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}