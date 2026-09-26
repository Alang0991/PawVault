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
import { useTranslation } from "@/hooks/use-translation"

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
  const { t } = useTranslation()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        } else {
          setError(t("support.error"))
        }
      } catch {
        setError(t("support.error"))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

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

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === "all") return true
    return ticket.status.toLowerCase() === activeTab.toLowerCase()
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

  const tabLabels = {
    all: t("support.tabs.all"),
    open: t("support.tabs.open"),
    waiting: t("support.tabs.waiting"),
    resolved: t("support.tabs.resolved"),
  }

  const categoryLabels: Record<string, string> = {
    billing: t("support.categories.billing"),
    technical: t("support.categories.technical"),
    account: t("support.categories.account"),
    legal: t("support.categories.legal"),
    other: t("support.categories.other"),
  }

  const statusLabels: Record<string, string> = {
    OPEN: t("support.status.open"),
    WAITING: t("support.status.waiting"),
    RESOLVED: t("support.status.resolved"),
  }

  const priorityLabels: Record<string, string> = {
    HIGH: t("support.priority.high"),
    MEDIUM: t("support.priority.medium"),
    LOW: t("support.priority.low"),
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{t("support.title")}</h1>
              <p className="text-sm text-text-secondary mt-1">{t("support.subtitle")}</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("support.newTicket")}
            </Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{t("support.createTicket")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("support.category")}</label>
                    <Select
                      value={form.category}
                      onValueChange={(value) =>
                        setForm({ ...form, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("support.categoryPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing">{categoryLabels.billing}</SelectItem>
                        <SelectItem value="technical">{categoryLabels.technical}</SelectItem>
                        <SelectItem value="account">{categoryLabels.account}</SelectItem>
                        <SelectItem value="legal">{categoryLabels.legal}</SelectItem>
                        <SelectItem value="other">{categoryLabels.other}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("support.subject")}</label>
                    <Input
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      placeholder={t("support.subjectPlaceholder")}
                      required
                      minLength={3}
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("support.message")}</label>
                    <Textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder={t("support.messagePlaceholder")}
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? t("support.submitting") : t("support.submit")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      {t("support.cancel")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{tabLabels.all}</TabsTrigger>
              <TabsTrigger value="open">{tabLabels.open}</TabsTrigger>
              <TabsTrigger value="waiting">{tabLabels.waiting}</TabsTrigger>
              <TabsTrigger value="resolved">{tabLabels.resolved}</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center py-12 text-text-muted">{t("support.loading")}</div>
          ) : error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-10 w-10 mx-auto mb-4 text-destructive" />
                <p className="text-text-secondary">{error}</p>
                <p className="text-sm text-text-muted mt-1">{t("support.retry")}</p>
              </CardContent>
            </Card>
          ) : filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-4 text-text-muted" />
                <p className="text-text-secondary">{t("support.noTickets")}</p>
                <p className="text-sm text-text-muted mt-1">{t("support.createTicketHint")}</p>
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
                            {categoryLabels[ticket.category] || ticket.category}
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
                            {priorityLabels[ticket.priority] || ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-muted">
                          {new Date(ticket.createdAt).toLocaleDateString()} ·{" "}
                          {ticket._count.messages} {t("support.messages")}
                          {ticket._count.messages !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/support/${ticket.id}`}>
                          {t("support.view")} <ArrowRight className="h-4 w-4 ml-1" />
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