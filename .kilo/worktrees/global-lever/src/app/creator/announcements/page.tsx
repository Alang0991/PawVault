"use client"

import { useEffect, useState } from "react"
import { Plus, Eye, Edit, Trash2, Calendar, Pin, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function CreatorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState("announcement")
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  async function loadAnnouncements() {
    try {
      const res = await fetch("/api/creator/announcements")
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch {
      // silent
    }
    setLoading(false)
  }

  const createAnnouncement = async () => {
    if (!title.trim() || !content.trim()) return
    setPublishing(true)
    try {
      const res = await fetch("/api/creator/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type, isPublished: true }),
      })
      if (res.ok) {
        setTitle("")
        setContent("")
        setType("announcement")
        setShowForm(false)
        loadAnnouncements()
      }
    } catch {
      // silent
    }
    setPublishing(false)
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading announcements...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Announcements</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gradient-bg text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="update">Product Update</SelectItem>
                  <SelectItem value="sale">Sale / Promotion</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="What&apos;s new?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            <Button
              onClick={createAnnouncement}
              disabled={publishing || !title.trim() || !content.trim()}
            >
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          </CardContent>
        </Card>
      )}

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="pt-10 text-center">
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{a.title}</h3>
                      {a.isPublished && (
                        <Badge variant="default" className="text-xs">
                          Published
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {a.type} · {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
