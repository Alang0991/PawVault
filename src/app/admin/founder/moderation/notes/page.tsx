import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MessageSquare, User, Package, Flag, Search } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"

export const dynamic = "force-dynamic"

export default async function ModerationNotesPage({
  searchParams,
}: {
  searchParams: { userId?: string; productId?: string; reportId?: string; q?: string }
}) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const query = searchParams.q || ""
  const targetUserId = searchParams.userId || ""
  const targetProductId = searchParams.productId || ""
  const targetReportId = searchParams.reportId || ""

  const where: any = {}
  if (targetUserId) where.userId = targetUserId
  if (targetProductId) where.productId = targetProductId
  if (targetReportId) where.reportId = targetReportId
  if (query && !targetUserId && !targetProductId && !targetReportId) {
    where.body = { contains: query, mode: "insensitive" }
  }

  const notes = await prisma.moderationNote.findMany({
    where,
    include: {
      author: { select: { id: true, username: true, displayName: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const targetUser = targetUserId
    ? await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, username: true, displayName: true, email: true, role: true, status: true },
      })
    : null

  const targetProduct = targetProductId
    ? await prisma.product.findUnique({
        where: { id: targetProductId },
        select: { id: true, title: true, slug: true, isPublished: true },
      })
    : null

  const targetReport = targetReportId
    ? await prisma.report.findUnique({
        where: { id: targetReportId },
        select: { id: true, reportedType: true, reportedId: true, reason: true, status: true },
      })
    : null

  const targetInfo = targetUser
    ? { icon: <User className="h-4 w-4 text-sky-500" />, label: `@${targetUser.username}`, sub: targetUser.displayName || "" }
    : targetProduct
      ? { icon: <Package className="h-4 w-4 text-amber-500" />, label: targetProduct.title, sub: targetProduct.slug }
      : targetReport
        ? { icon: <Flag className="h-4 w-4 text-rose-500" />, label: `${targetReport.reportedType} #${targetReport.reportedId}`, sub: targetReport.status }
        : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Moderation Notes</h1>
          <p className="text-sm text-muted-foreground">Staff-only moderation notes for users, products, and reports</p>
        </div>
        <Link href="/admin/founder/moderation">
          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4 mr-2" />
            Moderation Queue
          </Button>
        </Link>
      </div>

      {targetInfo && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {targetInfo.icon}
              <CardTitle className="text-base">
                {targetInfo.label} {targetInfo.sub && <span className="text-muted-foreground font-normal">— {targetInfo.sub}</span>}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form action="/api/admin/moderation/notes" method="POST" className="space-y-3">
              <input type="hidden" name="userId" value={targetUserId} />
              <input type="hidden" name="productId" value={targetProductId} />
              <input type="hidden" name="reportId" value={targetReportId} />
              <Textarea
                name="body"
                required
                placeholder="Add a moderation note visible only to staff..."
                rows={4}
              />
              <Button type="submit" size="sm">
                Add Note
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!targetInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search notes</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="GET" action="/admin/founder/moderation/notes" className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search note text..."
                  className="w-full pl-10 pr-3 py-2 border rounded-md bg-background text-sm"
                />
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
              {query && (
                <Link href="/admin/founder/moderation/notes">
                  <Button variant="outline" size="sm">Clear</Button>
                </Link>
              )}
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              Tip: Link to a specific user, product, or report from the moderation queue to add notes.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
            {targetInfo && ` for ${targetInfo.label}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No moderation notes found.
              {targetInfo
                ? " Add a note above."
                : " Filter by user, product, or report, or search existing notes."}
            </p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {note.createdAt instanceof Date
                        ? new Date(note.createdAt).toLocaleString()
                        : new Date(note.createdAt).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{note.author.displayName || note.author.username}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {note.author.role}
                    </Badge>
                    {note.userId && (
                      <>
                        <span>•</span>
                        <span>User: {note.userId.slice(0, 8)}…</span>
                      </>
                    )}
                    {note.productId && (
                      <>
                        <span>•</span>
                        <span>Product: {note.productId.slice(0, 8)}…</span>
                      </>
                    )}
                    {note.reportId && (
                      <>
                        <span>•</span>
                        <span>Report: {note.reportId.slice(0, 8)}…</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">
        ← Back to Founder Hub
      </Link>
    </div>
  )
}
