"use client"

import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Shield, AlertTriangle, History, FileText, Plus } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"

export const dynamic = "force-dynamic"

export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, username: true, displayName: true, email: true, role: true,
      status: true, isVerified: true, isFeatured: true, createdAt: true,
      bannedReason: true, suspendedReason: true, suspendedUntil: true,
      customPermissions: true, creatorStatus: true, bio: true, avatar: true,
    },
  })

  if (!target) {
    redirect("/admin/founder/users")
  }

  const [appeals, moderation, reports] = await Promise.all([
    prisma.appeal.findMany({
      where: { userId: params.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, displayName: true } } },
    }),
    prisma.userModeration.findMany({
      where: { userId: params.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.findMany({
      where: { reportedId: params.id, reportedType: "USER" },
      orderBy: { createdAt: "desc" },
      include: { reporter: { select: { username: true, displayName: true } }, actions: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{target.displayName || target.username}</h1>
        <p className="text-sm text-muted-foreground">@{target.username} · {target.role}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant={target.status === "ACTIVE" ? "default" : "destructive"} className="mt-1">{target.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Verified</p>
            <Badge variant={target.isVerified ? "default" : "secondary"} className="mt-1">{target.isVerified ? "Yes" : "No"}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Role</p>
            <Badge variant={target.role === "ADMIN" || target.role === "FOUNDER" ? "default" : "secondary"} className="mt-1">{target.role}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Appeals</p>
            <p className="text-xl font-bold mt-1">{appeals.length}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" /> Security Actions
        </h2>
        {target.role !== "FOUNDER" && target.id !== user.id && (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <form action="/api/admin/users/[id]/status" method="POST" className="inline-flex gap-1">
                  <input type="hidden" name="userId" value={target.id} />
                  <input type="hidden" name="status" value="SUSPENDED" />
                  <Input name="reason" placeholder="Reason (required)" required className="w-48" />
                  <Button type="submit" size="sm" variant="destructive">Suspend</Button>
                </form>
                <form action="/api/admin/users/[id]/status" method="POST" className="inline-flex gap-1">
                  <input type="hidden" name="userId" value={target.id} />
                  <input type="hidden" name="status" value="BANNED" />
                  <Input name="reason" placeholder="Reason (required)" required className="w-48" />
                  <Button type="submit" size="sm" variant="destructive">Ban</Button>
                </form>
                <form action="/api/admin/users/[id]/status" method="POST" className="inline-flex gap-1">
                  <input type="hidden" name="userId" value={target.id} />
                  <input type="hidden" name="status" value="ACTIVE" />
                  <Button type="submit" size="sm" variant="secondary">Restore</Button>
                </form>
              </div>
              {target.status === "BANNED" || target.status === "SUSPENDED" ? (
                <p className="text-xs text-rose-600">Account is currently {target.status.toLowerCase()}. Actions above are available.</p>
              ) : (
                <p className="text-xs text-muted-foreground">Account is active.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Restrictions & Notes
        </h2>
        <Card>
          <CardContent className="pt-4 space-y-2">
            {target.suspendedUntil && new Date(target.suspendedUntil) > new Date() && (
              <p className="text-sm">Suspended until {new Date(target.suspendedUntil).toISOString()}</p>
            )}
            {target.suspendedReason && <p className="text-sm text-muted-foreground">Suspension reason: {target.suspendedReason}</p>}
            {target.bannedReason && <p className="text-sm text-rose-600">Ban reason: {target.bannedReason}</p>}
            {!target.suspendedUntil && !target.bannedReason && <p className="text-sm text-muted-foreground">No active restrictions.</p>}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" /> Moderation History
        </h2>
        <Card>
          <CardContent className="pt-4">
            {moderation.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No moderation records.</p>
            ) : (
              <div className="space-y-2">
                {moderation.map((m) => (
                  <div key={m.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{m.action}</p>
                      {m.reason && <p className="text-xs text-muted-foreground">{m.reason}</p>}
                      {m.expiresAt && <p className="text-xs text-muted-foreground">Expires: {new Date(m.expiresAt).toISOString()}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" /> User Appeals
        </h2>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">File Appeal</CardTitle>
          </CardHeader>
          <CardContent>
            <AppealForm userId={target.id} />
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Appeal History ({appeals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {appeals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No appeals yet.</p>
            ) : (
              <div className="space-y-2">
                {appeals.map((a) => (
                  <div key={a.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{a.type}</p>
                      <p className="text-xs text-muted-foreground">{a.reason}</p>
                      {a.evidence && <p className="text-xs text-muted-foreground">Evidence: {a.evidence}</p>}
                      <p className="text-xs text-muted-foreground">Resolution: {a.resolution || "Pending"}</p>
                    </div>
                    <Badge variant={a.status === "PENDING" ? "secondary" : a.status === "APPROVED" ? "default" : "destructive"} className="text-xs">{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reports Filed Against User ({reports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm">{r.reason}</p>
                    <p className="text-xs text-muted-foreground">Reported by {r.reporter.displayName || r.reporter.username}</p>
                    <p className="text-xs text-muted-foreground">Status: {r.status}</p>
                  </div>
                  <Badge variant={r.status === "PENDING" ? "destructive" : "secondary"} className="text-xs">{r.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Link href="/admin/founder/users" className="text-sm underline">← Back</Link>
    </div>
  )
}

function AppealForm({ userId }: { userId: string }) {
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
