"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Pencil, Trash2, Clock, Calendar } from "lucide-react"
import Link from "next/link"

interface Tutorial {
  id: string
  title: string
  slug: string
  summary: string | null
  category: string
  tags: string[]
  readTime: number | null
  isPublished: boolean
  publishedAt: Date | null
  displayOrder: number
  createdAt: Date
  author: { username: string; displayName: string | null } | null
}

export function TutorialRow({ tutorial }: { tutorial: Tutorial }) {
  const [busy, setBusy] = useState(false)

  async function togglePublished() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/tutorials/${tutorial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !tutorial.isPublished }),
      })
      if (res.ok) window.location.reload()
    } catch {
      // swallow
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm(`Delete "${tutorial.title}"?`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/tutorials/${tutorial.id}`, { method: "DELETE" })
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
          <p className="font-medium text-sm truncate">{tutorial.title}</p>
          <p className="text-xs text-muted-foreground">
            /{tutorial.category}
            {tutorial.readTime ? ` · ${tutorial.readTime} min read` : ""}
            {tutorial.author ? ` · by ${tutorial.author.displayName || tutorial.author.username}` : ""}
          </p>
          {tutorial.summary && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{tutorial.summary}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={tutorial.isPublished ? "default" : "secondary"} className="text-xs">
            {tutorial.isPublished ? "Published" : "Draft"}
          </Badge>
          <Button size="sm" variant="outline" asChild>
            <Link href={tutorial.isPublished ? `/tutorials/${tutorial.slug}` : "#"}>
              <Pencil className="h-3 w-3" />
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={togglePublished} disabled={busy}>
            {tutorial.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={remove} disabled={busy}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}