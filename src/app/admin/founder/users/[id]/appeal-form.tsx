"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

/**
 * Filed with fetch + router.refresh() so the server component that owns the
 * page re-runs its queries. Kept in its own client module because the page
 * itself is a server component that talks to Prisma directly.
 */
export function AppealForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const form = e.currentTarget as HTMLFormElement
      const fd = new FormData(form)
      const type = fd.get("type") as string
      const reason = fd.get("reason") as string
      const evidence = (fd.get("evidence") as string) || undefined

      const res = await fetch("/api/admin/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, reason, evidence }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Failed to file appeal")
        return
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium">Appeal Type</label>
        <select name="type" required className="w-full border rounded-md px-3 py-2 bg-background text-sm">
          <option value="">Select type...</option>
          <option value="ACCOUNT_SUSPENSION">Account Suspension</option>
          <option value="ACCOUNT_BAN">Account Ban</option>
          <option value="PRODUCT_REJECTION">Product Rejection</option>
          <option value="CREATOR_APPLICATION">Creator Application</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">Reason</label>
        <Textarea name="reason" required placeholder="Explain the appeal..." className="w-full" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">Evidence (optional)</label>
        <Textarea name="evidence" placeholder="Provide supporting evidence..." className="w-full" />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Filing..." : "File Appeal"}
      </Button>
    </form>
  )
}
