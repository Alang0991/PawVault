export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { renderMarkdown } from "@/lib/markdown"

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  let event: any = null
  try {
    event = await prisma.event.findUnique({
      where: { slug: params.slug },
      include: { creator: { select: { username: true, displayName: true } } },
    })
  } catch (error) {
    console.error("Failed to fetch event:", error)
  }

  if (!event || !event.isPublished) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm">
        <Link href="/events">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to events
        </Link>
      </Button>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {new Date(event.startDate).toLocaleDateString()}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold">{event.title}</h1>
        {event.creator && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            Organized by {event.creator.displayName || event.creator.username}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">When</p>
                <p className="text-muted-foreground">
                  {new Date(event.startDate).toLocaleString()}
                  {event.endDate && ` - ${new Date(event.endDate).toLocaleString()}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {event.location && (
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Where</p>
                  <p className="text-muted-foreground">{event.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {event.description && (
        <Card>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none py-6">
            {renderMarkdown(event.description)}
          </CardContent>
        </Card>
      )}
    </div>
  )
}