import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Megaphone, Clock, Pin, Calendar } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"

export const dynamic = "force-dynamic"

export default async function FounderAnnouncementsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let announcements: any[] = []
  try {
    announcements = await prisma.announcement.findMany({
      orderBy: [{ isPinned: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
      take: 100,
      include: { author: { select: { username: true, displayName: true, role: true } } },
    })
  } catch (error) {
    console.error("Failed to fetch announcements:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-sm text-muted-foreground">{announcements.length} announcements</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create announcement</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/announcements" method="POST" className="space-y-3">
            <Input name="title" required placeholder="Title" />
            <Textarea name="body" required placeholder="Body" />
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Schedule (optional)</Label>
                <Input name="scheduledAt" type="datetime-local" />
              </div>
              <div className="space-y-1">
                <Label>Priority (0-100)</Label>
                <Input name="priority" type="number" min="0" max="100" defaultValue="0" />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isPinned" value="true" className="rounded" />
                  <Pin className="h-3 w-3" /> Pin
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isPublished" value="true" className="rounded" />
                  Publish
                </label>
              </div>
            </div>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">All announcements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">
                      {a.isPinned && <Pin className="h-3 w-3 inline mr-1 text-yellow-500" />}
                      {a.title}
                    </p>
                    <div className="flex items-center gap-2">
                      {a.scheduledAt && !a.isPublished && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" /> Scheduled
                        </Badge>
                      )}
                      <Badge variant={a.isPublished ? "default" : "secondary"} className="text-xs">
                        {a.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex gap-1">
                        {a.isPublished ? (
                          <AdminActionButton url={`/api/admin/announcements/${a.id}`} method="PATCH" body={{ isPublished: false }} variant="secondary" size="sm">Unpublish</AdminActionButton>
                        ) : (
                          <AdminActionButton url={`/api/admin/announcements/${a.id}`} method="PATCH" body={{ isPublished: true }} size="sm">Publish</AdminActionButton>
                        )}
                        <AdminActionButton url={`/api/admin/announcements/${a.id}`} method="PATCH" body={{ isPinned: !a.isPinned }} variant="outline" size="sm">
                          {a.isPinned ? "Unpin" : "Pin"}
                        </AdminActionButton>
                        <form action={`/api/admin/announcements/${a.id}`} method="POST" className="inline">
                          <input type="hidden" name="_method" value="DELETE" />
                          <Button type="submit" size="sm" variant="destructive" className="text-xs">Delete</Button>
                        </form>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    by {a.author.displayName || a.author.username}
                    {a.scheduledAt && (
                      <span className="ml-2">
                        <Clock className="h-3 w-3 inline" /> {new Date(a.scheduledAt).toLocaleString()}
                      </span>
                    )}
                  </p>
                  <p className="text-sm mt-1 line-clamp-2">{a.body}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}