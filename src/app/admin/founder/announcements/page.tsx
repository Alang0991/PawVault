import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Megaphone } from "lucide-react"
import Link from "next/link"

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
        <h1 className="text-3xl font-bold">Announcements</h1>
        <p className="text-muted-foreground">{announcements.length} announcements</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <CardTitle>Official posts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{a.title}</p>
                    <Badge variant={a.isPublished ? "default" : "secondary"}>
                      {a.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
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
