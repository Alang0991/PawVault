import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollText, Clock, GitBranch, Eye, EyeOff, Calendar, RotateCcw } from "lucide-react"
import Link from "next/link"
import { PublishingDraftRow } from "@/components/publishing-draft-row"

export const dynamic = "force-dynamic"

export default async function FounderPublishingPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const status = searchParams.status || "all"
  const where: any = {}
  if (status !== "all") where.status = status

  let drafts: any[] = []
  try {
    drafts = await prisma.publishingDraft.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: 100,
      include: {
        publishedBy: { select: { username: true, displayName: true } },
      },
    })
  } catch (error) {
    console.error("Failed to fetch publishing drafts:", error)
  }

  const statusConfig: Record<string, { color: any; label: string }> = {
    DRAFT: { color: "secondary", label: "Draft" },
    PENDING_REVIEW: { color: "default", label: "Pending review" },
    SCHEDULED: { color: "default", label: "Scheduled" },
    PUBLISHED: { color: "default", label: "Published" },
    ROLLED_BACK: { color: "destructive", label: "Rolled back" },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publishing</h1>
          <p className="text-sm text-muted-foreground">
            Draft, preview, schedule, and rollback website changes.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/founder">← Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <ScrollText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create publishing draft</CardTitle>
          </div>
          <CardDescription>Save changes as a draft before going live.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/publishing" method="POST" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input name="title" required placeholder="e.g. Homepage hero update" />
              </div>
              <div className="space-y-1">
                <Label>Resource type</Label>
                <select name="resourceType" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  <option value="homepage_section">Homepage section</option>
                  <option value="announcement">Announcement</option>
                  <option value="appearance">Appearance</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Resource ID (optional)</Label>
                <Input name="resourceId" placeholder="Section or announcement ID" />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select name="status" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Pending review</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Summary (optional)</Label>
              <Input name="summary" placeholder="Short description of the change" />
            </div>
            <div className="space-y-1">
              <Label>Changes (JSON)</Label>
              <Textarea
                name="changes"
                required
                rows={4}
                placeholder='{"hero": {"title": "New hero"}}'
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label>Schedule (optional)</Label>
              <Input name="scheduledAt" type="datetime-local" />
            </div>
            <Button type="submit" size="sm">
              <ScrollText className="h-3 w-3 mr-1" /> Save draft
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Publishing queue</CardTitle>
              <CardDescription>{drafts.length} drafts</CardDescription>
            </div>
            <div className="flex gap-1">
              {["all", "DRAFT", "PENDING_REVIEW", "SCHEDULED", "PUBLISHED", "ROLLED_BACK"].map((s) => (
                <Button
                  key={s}
                  asChild
                  size="sm"
                  variant={status === s ? "default" : "ghost"}
                  className="text-xs"
                >
                  <Link href={s === "all" ? "/admin/founder/publishing" : `/admin/founder/publishing?status=${s}`}>
                    {s === "all" ? "All" : statusConfig[s]?.label ?? s}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No publishing drafts yet.
            </p>
          ) : (
            <div className="space-y-3">
              {drafts.map((d) => (
                <PublishingDraftRow key={d.id} draft={d} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}