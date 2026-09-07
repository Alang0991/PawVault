"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ArrowLeft, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react"

interface Message {
  id: string
  content: string
  isStaff: boolean
  createdAt: string
  user: {
    id: string
    username: string
    displayName: string | null
    avatar: string | null
    role: string | null
  }
}

interface Ticket {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  createdAt: string
  messages: Message[]
}

export default function SupportTicketPage() {
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/support/${ticketId}`)
        if (!res.ok) throw new Error("Failed to load ticket")
        const data = await res.json()
        setTicket(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ticketId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/support/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      })
      if (!res.ok) throw new Error("Failed to send message")
      const newMessage = await res.json()
      setTicket((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, newMessage],
            }
          : prev
      )
      setMessage("")
    } catch {
      // non-fatal
    } finally {
      setSending(false)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "WAITING":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "RESOLVED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-text-muted" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p className="text-text-muted">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600 mb-4">{error || "Ticket not found"}</p>
              <Button asChild>
                <Link href="/support">Back to Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/support">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Support
              </Link>
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {statusIcon(ticket.status)}
                      <CardTitle>{ticket.subject}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{ticket.category}</Badge>
                      <Badge
                        variant={
                          ticket.priority === "HIGH"
                            ? "destructive"
                            : ticket.priority === "MEDIUM"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="space-y-4 mb-6">
            {ticket.messages.map((msg) => (
              <Card
                key={msg.id}
                className={
                  msg.isStaff
                    ? "border-purple-200 dark:border-purple-800"
                    : ""
                }
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.user.avatar || ""} />
                      <AvatarFallback>
                        {(msg.user.displayName || msg.user.username)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {msg.user.displayName || msg.user.username}
                        </span>
                        {msg.isStaff && (
                          <Badge variant="outline" className="text-xs">
                            Support
                          </Badge>
                        )}
                        <span className="text-xs text-text-muted">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleSend} className="flex gap-3">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  required
                  minLength={2}
                  maxLength={5000}
                  rows={3}
                  className="flex-1"
                />
                <Button type="submit" disabled={sending || !message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
