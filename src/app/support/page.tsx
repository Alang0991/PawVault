"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { MessageSquare, Plus, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react"

interface SupportTicket {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  createdAt: string
  _count: { messages: number }
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const [form, setForm] = useState({
    subject: "",
    category: "technical",
    message: "",
    priority: "MEDIUM",
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/support")
        if (res.ok) {
          const data = await res.json()
          setTickets(data.tickets || [])
        }
      } catch {
        // non-fatal
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to create ticket")
      const ticket = await res.json()
      setTickets((prev) => [ticket, ...prev])
      setForm({ subject: "", category: "technical", message: "", priority: "MEDIUM" })
      setShowForm(false)
    } catch {
      // non-fatal
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "all") return true
    return t.status.toLowerCase() === activeTab.toLowerCase()
  })

  const statusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "WAITING":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "RESOLVED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-text-muted" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Support</h1>
              <p className="text-sm text-text-secondary mt-1">
                Get help with orders, accounts, and platform questions.
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={form.category}
                      onValueChange={(value) =>
                        setForm({ ...form, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      placeholder="Brief description of your issue"
                      required
                      minLength={3}
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder="Describe your issue in detail..."
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Ticket"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="waiting">Waiting</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center py-12 text-text-muted">Loading...</div>
          ) : filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-4 text-text-muted" />
                <p className="text-text-secondary">No support tickets yet.</p>
                <p className="text-sm text-text-muted mt-1">
                  Create a ticket if you need help.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="pt-1">{statusIcon(ticket.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-text-primary">
                            {ticket.subject}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {ticket.category}
                          </Badge>
                          <Badge
                            variant={
                              ticket.priority === "HIGH"
                                ? "destructive"
                                : ticket.priority === "MEDIUM"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-muted">
                          {new Date(ticket.createdAt).toLocaleDateString()} ·{" "}
                          {ticket._count.messages} message
                          {ticket._count.messages !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/support/${ticket.id}`}>
                          View <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
