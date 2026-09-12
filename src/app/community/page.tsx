"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  MessageSquare,
  Heart,
  Trophy,
  Calendar,
  Hash,
  ArrowRight,
  ExternalLink,
  Globe,
  MessageCircle,
  Twitter,
  Youtube,
} from "lucide-react"

interface CommunityPost {
  id: string
  title: string
  content: string
  type: "discussion" | "showcase" | "question" | "announcement" | "event"
  author: {
    id: string
    username: string
    displayName: string
    avatar: string | null
    role: string
    isVerified: boolean
  }
  tags: string[]
  likes: number
  replies: number
  views: number
  isPinned: boolean
  isLocked: boolean
  createdAt: string
  updatedAt: string
}

interface CommunityEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string | null
  location: string
  imageUrl: string | null
  isOnline: boolean
  host: {
    id: string
    username: string
    displayName: string
    avatar: string | null
  }
  attendees: number
  maxAttendees: number | null
  tags: string[]
  status: "upcoming" | "live" | "ended"
}

interface TrendingTopic {
  tag: string
  postCount: number
  growth: number
}

const TYPE_ICONS = {
  discussion: MessageSquare,
  showcase: Heart,
  question: Users,
  announcement: Trophy,
  event: Calendar,
}

const TYPE_LABELS = {
  discussion: "Discussion",
  showcase: "Showcase",
  question: "Question",
  announcement: "Announcement",
  event: "Event",
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "events" | "trending" | "leaderboard">("feed")
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [trending, setTrending] = useState<TrendingTopic[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [postsRes, eventsRes, trendingRes, leaderboardRes] = await Promise.all([
          fetch("/api/community/posts?limit=20"),
          fetch("/api/community/events?limit=10"),
          fetch("/api/community/trending?limit=10"),
          fetch("/api/community/leaderboard?limit=10"),
        ])
        setPosts((await postsRes.json()).posts || [])
        setEvents((await eventsRes.json()).events || [])
        setTrending((await trendingRes.json()).topics || [])
        setLeaderboard((await leaderboardRes.json()).users || [])
      } catch (err) {
        console.error("Failed to load community data:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-violet-600 to-indigo-600 mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-text-primary mb-4">Community</h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Connect with creators, share your work, and join the conversation.
              </p>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/4 bg-muted rounded" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                        <div className="h-4 w-1/2 bg-muted rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-violet-600 to-indigo-600 mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">Community</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Connect with creators, share your work, and join the conversation.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "feed" | "events" | "trending" | "leaderboard")} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="feed">
                <MessageSquare className="h-4 w-4 mr-2" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="trending">
                <Hash className="h-4 w-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                    <p className="text-text-secondary">No posts yet. Be the first to start a discussion!</p>
                    <Button asChild className="mt-4">
                      <Link href="/community/create">Create Post</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <CommunityPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {events.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                    <p className="text-text-secondary">No upcoming events.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trending Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  {trending.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">No trending topics yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {trending.map((topic, index) => (
                        <div
                          key={topic.tag}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-text-muted/50">{index + 1}</span>
                            <div>
                              <Link
                                href={`/search?q=%23${encodeURIComponent(topic.tag)}`}
                                className="font-medium text-text-primary hover:text-accent-foreground flex items-center gap-2"
                              >
                                <Hash className="h-5 w-5" />
                                #{topic.tag}
                              </Link>
                              <p className="text-sm text-text-muted">{topic.postCount} posts</p>
                            </div>
                          </div>
                          <Badge
                            variant={topic.growth > 0 ? "default" : "secondary"}
                            className="gap-1"
                          >
                            {topic.growth > 0 ? "+" : ""}{topic.growth}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboard.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">No leaderboard data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((user, index) => (
                        <Link
                          key={user.id}
                          href={`/profile/${user.username}`}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/5 transition-colors group"
                        >
                          <span className="text-xl font-bold text-text-muted/50 w-8 text-right">
                            {index + 1}
                          </span>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || ""} alt={user.displayName} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-500">
                              {user.displayName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary truncate">{user.displayName}</p>
                            <p className="text-sm text-text-muted">@{user.username}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-text-primary">{user.points || 0} pts</p>
                            <p className="text-xs text-text-muted">{user.rank || "Member"}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function CommunityPostCard({ post }: { post: CommunityPost }) {
  const TypeIcon = TYPE_ICONS[post.type]
  const timeAgo = formatTimeAgo(post.createdAt)

  return (
    <Card className={`relative overflow-hidden ${post.isPinned ? "border-purple-200 dark:border-purple-800" : ""}`}>
      {post.isPinned && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
      )}
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={post.author.avatar || ""} alt={post.author.displayName} />
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-500">
              {post.author.displayName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <span className="font-medium text-text-primary">{post.author.displayName}</span>
                <span className="text-text-muted">@{post.author.username}</span>
                {post.author.isVerified && (
                  <Badge variant="default" className="bg-green-500 text-green-foreground gap-1 h-5 px-1.5">
                    <span className="text-[10px]">✓</span>
                  </Badge>
                )}
              </div>
              <span className="text-text-muted">{timeAgo}</span>
              {post.isPinned && (
                <Badge variant="outline" className="text-xs gap-1 ml-auto">
                  <span className="text-[10px]">📌</span>
                  Pinned
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="gap-1 text-xs">
                <TypeIcon className="h-3 w-3" />
                {TYPE_LABELS[post.type]}
              </Badge>
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=%23${encodeURIComponent(tag)}`}
                  className="text-sm text-text-muted hover:text-accent-foreground flex items-center gap-1"
                >
                  <Hash className="h-3 w-3" />
                  {tag}
                </Link>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">+{post.tags.length - 3}</Badge>
              )}
            </div>

            {post.title && (
              <h3 className="font-semibold text-lg text-text-primary mb-2">{post.title}</h3>
            )}
            <p className="text-text-secondary mb-4 line-clamp-3">{post.content}</p>

            <div className="flex items-center gap-6 text-sm text-text-muted pt-4 border-t">
              <Link href={`/community/posts/${post.id}`} className="flex items-center gap-1 hover:text-text-primary">
                <MessageSquare className="h-4 w-4" />
                {post.replies}
              </Link>
              <Link href={`/community/posts/${post.id}`} className="flex items-center gap-1 hover:text-text-primary">
                <Heart className="h-4 w-4" />
                {post.likes}
              </Link>
              <Link href={`/community/posts/${post.id}`} className="flex items-center gap-1 hover:text-text-primary">
                <Globe className="h-4 w-4" />
                {post.views}
              </Link>
              {post.type === "event" && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Event
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EventCard({ event }: { event: CommunityEvent }) {
  const isUpcoming = event.status === "upcoming"
  const isLive = event.status === "live"
  const eventDate = new Date(event.startDate)

  return (
    <Card className="overflow-hidden h-full">
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-40 object-cover"
        />
      )}
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={isLive ? "default" : isUpcoming ? "outline" : "secondary"}>
            {isLive ? "Live Now" : isUpcoming ? "Upcoming" : "Ended"}
          </Badge>
          {event.isOnline && (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              Online
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-lg text-text-primary mb-2">{event.title}</h3>
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">{event.description}</p>
        <div className="flex items-center gap-3 text-sm text-text-muted mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {eventDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
          {event.location && !event.isOnline && (
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {event.location}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={event.host.avatar || ""} alt={event.host.displayName} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-violet-600 to-fuchsia-500">
                {event.host.displayName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "H"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-text-primary">{event.host.displayName}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.maxAttendees && (
              <span className="text-sm text-text-muted">
                {event.attendees}/{event.maxAttendees}
              </span>
            )}
            <Button size="sm" variant="outline" asChild>
              <Link href={`/events/${event.id}`}>
                View
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}