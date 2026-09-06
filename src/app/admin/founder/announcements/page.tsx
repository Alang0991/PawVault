import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { Megaphone } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"

export const dynamic = "force-dynamic"

export default async function FounderAnnouncementsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { author: { select: { username: true, displayName: true, role: true } } },
  })

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
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isPublished" value="true" className="rounded" />
                Publish immediately
              </label>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Official posts</CardTitle>
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
                    <p className="font-medium text-sm">{a.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.isPublished ? "default" : "secondary"} className="text-xs">
                        {a.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex gap-1">
                        {a.isPublished ? (
                          <AdminActionButton url={`/api/admin/announcements/${a.id}`} method="PATCH" body={{ isPublished: false }} variant="secondary" size="sm">Unpublish</AdminActionButton>
                        ) : (
                          <AdminActionButton url={`/api/admin/announcements/${a.id}`} method="PATCH" body={{ isPublished: true }} size="sm">Publish</AdminActionButton>
                        )}
                        <form action={`/api/admin/announcements/${a.id}`} method="POST" className="inline">
                          <input type="hidden" name="_method" value="DELETE" />
                          <Button type="submit" size="sm" variant="destructive" className="text-xs">Delete</Button>
                        </form>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    by {a.author.displayName || a.author.username}
                    {a.author.role === "FOUNDER" && " · Founder"}
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
