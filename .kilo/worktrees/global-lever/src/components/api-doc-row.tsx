"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Pencil, Trash2, Code } from "lucide-react"
import Link from "next/link"

interface Doc {
  id: string
  title: string
  slug: string
  summary: string | null
  endpoint: string | null
  method: string | null
  category: string
  tags: string[]
  isPublished: boolean
  displayOrder: number
  createdAt: Date
  author: { username: string; displayName: string | null } | null
}

export function APIDocRow({ doc }: { doc: Doc }) {
  const [busy, setBusy] = useState(false)

  async function togglePublished() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/api-docs/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !doc.isPublished }),
      })
      if (res.ok) window.location.reload()
    } catch {
      // swallow
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm(`Delete "${doc.title}"?`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/api-docs/${doc.id}`, { method: "DELETE" })
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
          <p className="font-medium text-sm truncate">{doc.title}</p>
          <p className="text-xs text-muted-foreground">
            {doc.endpoint && <span className="font-mono">{doc.method || "GET"} {doc.endpoint}</span>}
            {doc.category}
            {doc.author ? ` · by ${doc.author.displayName || doc.author.username}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={doc.isPublished ? "default" : "secondary"} className="text-xs">
            {doc.isPublished ? "Published" : "Draft"}
          </Badge>
          <Button size="sm" variant="outline" asChild>
            <Link href={doc.isPublished ? `/api-docs/${doc.slug}` : "#"}>
              <Pencil className="h-3 w-3" />
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={togglePublished} disabled={busy}>
            {doc.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={remove} disabled={busy}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}