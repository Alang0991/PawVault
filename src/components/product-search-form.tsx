"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Filter } from "lucide-react"

interface Props {
  q: string
  status: string
  featured: string
  creator: string
  creators: Array<{ id: string; username: string; displayName: string | null }>
}

export function ProductSearchForm({ q, status, featured, creator, creators }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function update(params: Record<string, string>) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value) searchParams.set(key, value)
    }
    startTransition(() => {
      router.push(`/admin/founder/products?${searchParams.toString()}`)
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <CardTitle className="text-base">Search and filter</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-wrap gap-2 items-end"
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget as HTMLFormElement
            const params: Record<string, string> = {}
            const qInput = form.elements.namedItem("q") as HTMLInputElement
            const statusSelect = form.elements.namedItem("status") as HTMLSelectElement
            const featuredSelect = form.elements.namedItem("featured") as HTMLSelectElement
            const creatorSelect = form.elements.namedItem("creator") as HTMLSelectElement
            if (qInput) params.q = qInput.value
            if (statusSelect) params.status = statusSelect.value
            if (featuredSelect) params.featured = featuredSelect.value
            if (creatorSelect) params.creator = creatorSelect.value
            update(params)
          }}
        >
          <div className="space-y-1">
            <label className="text-xs font-medium">Search</label>
            <Input name="q" defaultValue={q} placeholder="Title, slug..." className="w-56" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Status</label>
            <select name="status" defaultValue={status} className="w-36 border rounded-md px-3 py-2 bg-background text-sm">
              <option value="">All</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="HIDDEN">Hidden</option>
              <option value="ARCHIVED">Archived</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Featured</label>
            <select name="featured" defaultValue={featured} className="w-32 border rounded-md px-3 py-2 bg-background text-sm">
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Creator</label>
            <select name="creator" defaultValue={creator} className="w-48 border rounded-md px-3 py-2 bg-background text-sm">
              <option value="">All creators</option>
              {creators.map((c) => (
                <option key={c.id} value={c.username}>{c.displayName || c.username}</option>
              ))}
            </select>
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Applying..." : "Apply"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}