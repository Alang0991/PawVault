"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Calendar, RotateCcw, Loader2 } from "lucide-react"

interface Draft {
  id: string
  title: string
  summary: string | null
  resourceType: string
  status: string
  scheduledAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  publishedBy: { username: string; displayName: string | null } | null
}

export function PublishingDraftRow({ draft }: { draft: Draft }) {
  const [busy, setBusy] = useState(false)

  async function runAction(action: "PUBLISH" | "SCHEDULE" | "ROLLBACK") {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/publishing/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) window.location.reload()
    } catch {
      // swallow
    } finally {
      setBusy(false)
    }
  }

  const statusColor: Record<string, string> = {
    DRAFT: "secondary",
    PENDING_REVIEW: "default",
    SCHEDULED: "default",
    PUBLISHED: "default",
    ROLLED_BACK: "destructive",
  }

  return (
    <div className="border-b pb-3 last:border-0">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{draft.title}</p>
          <p className="text-xs text-muted-foreground">
            {draft.resourceType}
            {draft.publishedBy ? ` · by ${draft.publishedBy.displayName || draft.publishedBy.username}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusColor[draft.status] as any} className="text-xs">
            {draft.status.replace("_", " ")}
          </Badge>
          {draft.scheduledAt && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(draft.scheduledAt).toLocaleString()}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        {draft.status === "DRAFT" || draft.status === "PENDING_REVIEW" ? (
          <Button size="sm" variant="default" onClick={() => runAction("PUBLISH")} disabled={busy}>
            {busy ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Eye className="h-3 w-3 mr-1" />}
            Publish
          </Button>
        ) : null}
        {draft.status === "DRAFT" ? (
          <Button size="sm" variant="outline" onClick={() => runAction("SCHEDULE")} disabled={busy}>
            <Calendar className="h-3 w-3 mr-1" /> Schedule
          </Button>
        ) : null}
        {draft.status === "PUBLISHED" ? (
          <Button size="sm" variant="destructive" onClick={() => runAction("ROLLBACK")} disabled={busy}>
            <RotateCcw className="h-3 w-3 mr-1" /> Rollback
          </Button>
        ) : null}
      </div>
    </div>
  )
}