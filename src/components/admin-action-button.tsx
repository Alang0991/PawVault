"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export async function adminAction(
  url: string,
  method: string,
  body: Record<string, any>,
) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Action failed")
  }
}

export function AdminActionButton({
  url,
  method,
  body,
  children,
  variant = "outline",
  size = "sm",
  confirm,
}: {
  url: string
  method: string
  body: Record<string, any>
  children: React.ReactNode
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  confirm?: string
}) {
  const router = useRouter()

  const handleClick = async () => {
    if (confirm && !window.confirm(confirm)) return
    try {
      await adminAction(url, method, body)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed")
    }
  }

  return (
    <Button type="button" onClick={handleClick} variant={variant} size={size}>
      {children}
    </Button>
  )
}
