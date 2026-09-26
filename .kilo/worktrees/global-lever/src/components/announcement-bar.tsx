import { cn } from "@/lib/utils"
import { Bell } from "lucide-react"

interface AnnouncementBarProps {
  announcement: {
    id: string
    title: string
    body: string
    publishedAt: string | Date | null
  }
}

export function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const text = announcement.title || announcement.body

  if (!text) return null

  const display = (announcement.body || announcement.title || "").slice(0, 200)

  return (
    <div className="border-b border-border bg-accent/5">
      <div className="container mx-auto flex items-center gap-2 px-4 py-2 text-sm">
        <Bell className="h-4 w-4 shrink-0 text-accent" />
        <span className="font-medium text-text-primary">
          {announcement.title}
        </span>
        {announcement.body && (
          <span className="text-text-muted">
            {display}
            {announcement.body.length > 200 ? "…" : ""}
          </span>
        )}
      </div>
    </div>
  )
}

AnnouncementBar.displayName = "AnnouncementBar"
