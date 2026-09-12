import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Eye, EyeOff, Trash2 } from "lucide-react"
import Link from "next/link"
import { EventRow } from "@/components/event-row"

export const dynamic = "force-dynamic"

export default async function FounderEventsPage({
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
  if (status === "published") where.isPublished = true
  else if (status === "draft") where.isPublished = false

  let events: any[] = []
  try {
    events = await prisma.event.findMany({
      where,
      include: { creator: { select: { username: true, displayName: true } } },
      orderBy: { startDate: "asc" },
      take: 100,
    })
  } catch (error) {
    console.error("Failed to fetch events:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-sm text-muted-foreground">Community events and gatherings.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/founder">← Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create event</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/events" method="POST" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input name="title" required placeholder="e.g. Creator meetup" />
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input name="slug" required placeholder="creator-meetup" />
              </div>
              <div className="space-y-1">
                <Label>Start</Label>
                <Input name="startDate" type="datetime-local" required />
              </div>
              <div className="space-y-1">
                <Label>End (optional)</Label>
                <Input name="endDate" type="datetime-local" />
              </div>
              <div className="space-y-1">
                <Label>Location (optional)</Label>
                <Input name="location" placeholder="Online / venue name" />
              </div>
              <div className="space-y-1">
                <Label>Image URL (optional)</Label>
                <Input name="imageUrl" placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea name="description" required rows={5} placeholder="Event details..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isPublished" value="true" className="rounded" />
              <Label>Publish</Label>
            </div>
            <Button type="submit" size="sm">
              <Calendar className="h-3 w-3 mr-1" /> Create event
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">All events</CardTitle>
              <CardDescription>{events.length} events</CardDescription>
            </div>
            <div className="flex gap-1">
              {["all", "published", "draft"].map((s) => (
                <Button
                  key={s}
                  asChild
                  size="sm"
                  variant={status === s ? "default" : "ghost"}
                  className="text-xs"
                >
                  <Link href={s === "all" ? "/admin/founder/events" : `/admin/founder/events?status=${s}`}>
                    {s === "all" ? "All" : s === "published" ? "Published" : "Draft"}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No events yet.</p>
          ) : (
            <div className="space-y-3">
              {events.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}