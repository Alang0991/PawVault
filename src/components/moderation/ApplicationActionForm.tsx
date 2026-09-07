"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Action = "approve" | "reject" | "request_changes" | "under_review"

interface Props {
  applicationId: string
  action: Action
  label: string
  variant?: "default" | "secondary" | "destructive" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  notes?: string
  redirectTo?: string
}

export function ApplicationActionForm({
  applicationId,
  action,
  label,
  variant = "default",
  size = "sm",
  notes,
  redirectTo,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setError(null)
    try {
      const res = await fetch(`/api/admin/creators/application/${applicationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          setError("You must be signed in.")
          return
        }
        if (res.status === 403) {
          setError("You don't have permission.")
          return
        }
        let msg = "Request failed"
        try {
          const data = await res.json()
          msg = data?.error || msg
        } catch {}
        setError(msg)
        return
      }

      startTransition(() => {
        router.refresh()
        if (redirectTo) router.push(redirectTo)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <Button
        type="button"
        size={size}
        variant={variant}
        disabled={pending}
        onClick={handleClick}
      >
        {pending ? "Working..." : label}
      </Button>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  )
}