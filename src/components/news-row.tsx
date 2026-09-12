"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Pencil, Trash2, Calendar, Folder } from "lucide-react"
import Link from "next/link"

interface News {
  id: string
  title: string
  slug: string
  summary: string | null
  category: string
  isPublished: boolean
  publishedAt: Date | null
  createdAt: Date
  author: { username: string; displayName: string | null } | null
}

export function NewsRow({ news }: { news: News }) {
  const [busy, setBusy] = useState(false)

  async function togglePublished() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/news/${news.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !news.isPublished }),
      })
      if (res.ok) window.location.reload()
    } catch {
      // swallow
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm(`Delete "${news.title}"?`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/news/${news.id}`, { method: "DELETE" })
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
          <p className="font-medium text-sm truncate">{news.title}</p>
          <p className="text-xs text-muted-foreground">
            /{news.category}
            {news.author ? ` · by ${news.author.displayName || news.author.username}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={news.isPublished ? "default" : "secondary"} className="text-xs">
            {news.isPublished ? "Published" : "Draft"}
          </Badge>
          <Button size="sm" variant="outline" asChild>
            <Link href={news.isPublished ? `/news/${news.slug}` : "#"}>
              <Pencil className="h-3 w-3" />
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={togglePublished} disabled={busy}>
            {news.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={remove} disabled={busy}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}