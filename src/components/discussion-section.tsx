"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Discussion {
  id: string
  title: string
  content: string
  createdAt: string
  author: { id: string; username: string; displayName: string; avatar: string | null }
  replies: Array<{
    id: string
    content: string
    createdAt: string
    author: { id: string; displayName: string; avatar: string | null }
  }>
  _count: { likes: number }
}

export function DiscussionSection({ productId }: { productId: string }) {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadDiscussions()
  }, [])

  async function loadDiscussions() {
    try {
      const res = await fetch(`/api/discussions?productId=${productId}`)
      if (res.ok) {
        const data = await res.json()
        setDiscussions(data.discussions || [])
      }
    } catch {
      // silent fail
    }
    setLoading(false)
  }

  const submitDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, title: newTitle, content: newContent }),
      })
      if (res.ok) {
        setNewTitle("")
        setNewContent("")
        loadDiscussions()
      }
    } catch {
      // silent fail
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Discussions ({discussions.length})
      </h2>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input
            placeholder="Discussion title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            maxLength={200}
          />
          <Textarea
            placeholder="Share your thoughts, questions, or insights..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
          />
          <Button
            onClick={submitDiscussion}
            disabled={submitting || !newTitle.trim() || !newContent.trim()}
          >
            {submitting ? (
              <>Posting...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Start Discussion
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading discussions...</p>
      ) : discussions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No discussions yet. Be the first to start one!
        </p>
      ) : (
        <div className="space-y-4">
          {discussions.map((d) => (
            <Card key={d.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={d.author.avatar || ""} />
                    <AvatarFallback className="text-xs">
                      {d.author.displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{d.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {d.author.displayName} ·{" "}
                      {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                    {d.replies.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {d.replies.length} {d.replies.length === 1 ? "reply" : "replies"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
