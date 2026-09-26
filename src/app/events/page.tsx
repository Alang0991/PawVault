export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function EventsPage() {
  let events: any[] = []
  try {
    events = await prisma.event.findMany({
      where: { isPublished: true },
      include: { creator: { select: { username: true, displayName: true } } },
      orderBy: { startDate: "asc" },
      take: 50,
    })
  } catch (error) {
    console.error("Failed to fetch events:", error)
  }

  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.endDate || e.startDate) >= now)
  const past = events.filter((e) => new Date(e.endDate || e.startDate) < now)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-7 w-7 text-primary" /> Events
        </h1>
        <p className="text-muted-foreground mt-1">
          Community events, live streams, and gatherings.
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No events scheduled yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" /> Upcoming
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((e) => (
                  <Card key={e.id} className="hover:shadow-md transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {new Date(e.startDate).toLocaleDateString()}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{e.title}</CardTitle>
                      {e.description && <CardDescription>{e.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(e.startDate).toLocaleTimeString()}
                        {e.endDate && ` - ${new Date(e.endDate).toLocaleTimeString()}`}
                      </div>
                      {e.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {e.location}
                        </div>
                      )}
                      {e.creator && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {e.creator.displayName || e.creator.username}
                        </div>
                      )}
                      <Button asChild size="sm" className="mt-2 w-full">
                        <Link href={`/events/${e.slug}`}>View details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Past events
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {past.map((e) => (
                  <Card key={e.id} className="opacity-75 hover:opacity-100 transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {new Date(e.startDate).toLocaleDateString()}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{e.title}</CardTitle>
                      {e.description && <CardDescription>{e.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <Button asChild size="sm" variant="ghost" className="w-full">
                        <Link href={`/events/${e.slug}`}>
                          View details <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}