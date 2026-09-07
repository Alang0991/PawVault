"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  ArrowUp,
  MessageSquare,
  Pin,
  Lock,
  Search,
  Filter,
  Lightbulb,
  Bug,
  MessageSquareText,
  TrendingUp,
  Zap,
  Code,
  MoreHorizontal,
} from "lucide-react"

interface FeedbackPost {
  id: string
  title: string
  content: string
  category: string
  status: string
  votes: number
  isPinned: boolean
  isLocked: boolean
  createdAt: string
  user: {
    id: string
    username: string
    displayName: string | null
    avatar: string | null
    role: string | null
  }
  commentCount: number
  voteCount: number
}

const CATEGORIES = [
  "Feature Request",
  "Bug Report",
  "Improvement",
  "Creator Request",
  "Marketplace Request",
  "API / Developer",
  "Other",
]

const STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "DECLINED",
  "DUPLICATE",
]

const CATEGORY_ICONS: Record<string, any> = {
  "Feature Request": Lightbulb,
  "Bug Report": Bug,
  "Improvement": TrendingUp,
  "Creator Request": MessageSquareText,
  "Marketplace Request": Zap,
  "API / Developer": Code,
  Other: MoreHorizontal,
}

export default function FeedbackPage() {
  const [posts, setPosts] = useState<FeedbackPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [votedPosts, setVotedPosts] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "Feature Request",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/session")
        if (res.ok) {
          const data = await res.json()
          setCurrentUser(data.user)
        }
      } catch {
        // non-fatal
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (activeTab !== "all") params.set("status", activeTab.toLowerCase())
        if (categoryFilter) params.set("category", categoryFilter)
        if (searchQuery) params.set("q", searchQuery)
        params.set("limit", "50")

        const res = await fetch(`/api/feedback?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to load feedback")
        const data = await res.json()
        setPosts(data.posts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeTab, categoryFilter, searchQuery])

  async function handleVote(postId: string) {
    if (!currentUser) {
      window.location.href = "/auth/signin"
      return
    }

    try {
      const res = await fetch(`/api/feedback/${postId}/vote`, { method: "POST" })
      if (!res.ok) throw new Error("Vote failed")
      const data = await res.json()

      setVotedPosts((prev) => {
        const next = new Set(prev)
        if (data.voted) {
          next.add(postId)
        } else {
          next.delete(postId)
        }
        return next
      })

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, votes: data.votes } : p))
      )
    } catch {
      // non-fatal
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) {
      window.location.href = "/auth/signin"
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to create feedback")
      const post = await res.json()
      setPosts((prev) => [post, ...prev])
      setForm({ title: "", content: "", category: "Feature Request" })
      setShowCreateForm(false)
    } catch {
      // non-fatal
    } finally {
      setSubmitting(false)
    }
  }

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "all") return true
    return p.status.toLowerCase() === activeTab.toLowerCase()
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Feedback</h1>
              <p className="text-sm text-text-secondary mt-1">
                Share ideas, report bugs, and vote on what matters.
              </p>
            </div>
            {currentUser && (
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus className="h-4 w-4 mr-2" />
                New Feedback
              </Button>
            )}
          </div>

          {showCreateForm && currentUser && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Short summary of your feedback"
                      required
                      minLength={3}
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="Describe your idea or issue in detail..."
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feedback..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter || ""}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="under_review">Review</TabsTrigger>
              <TabsTrigger value="planned">Planned</TabsTrigger>
              <TabsTrigger value="in_progress">Progress</TabsTrigger>
              <TabsTrigger value="completed">Done</TabsTrigger>
              <TabsTrigger value="declined">Declined</TabsTrigger>
              <TabsTrigger value="duplicate">Duplicate</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center py-12 text-text-muted">Loading...</div>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center text-red-600">{error}</CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-4 text-text-muted" />
                <p className="text-text-secondary">No feedback matches your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const CategoryIcon = CATEGORY_ICONS[post.category] || MessageSquareText
                const hasVoted = votedPosts.has(post.id)

                return (
                  <Card
                    key={post.id}
                    className={`hover:shadow-md transition-shadow ${
                      post.isPinned ? "border-purple-200 dark:border-purple-800" : ""
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <Button
                            variant={hasVoted ? "default" : "outline"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleVote(post.id)}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-semibold tabular-nums">
                            {post.votes}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {post.isPinned && (
                                <Badge variant="outline" className="text-xs">
                                  <Pin className="h-3 w-3 mr-1" />
                                  Pinned
                                </Badge>
                              )}
                              {post.isLocked && (
                                <Badge variant="secondary" className="text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Locked
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {post.category}
                              </Badge>
                              <Badge
                                variant={
                                  post.status === "COMPLETED"
                                    ? "default"
                                    : post.status === "DECLINED"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {post.status.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>

                          <h3 className="font-semibold text-lg mb-1 text-text-primary">
                            {post.title}
                          </h3>
                          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                            {post.content}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-text-muted">
                            <span>
                              by {post.user.displayName || post.user.username}
                            </span>
                            <span>·</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.commentCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
