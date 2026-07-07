"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/helpers"
import { Bell, Trash2, Check } from "lucide-react"

interface Notification {
  id: string
  type: string
  title: string
  content: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications")
        const data = await res.json()
        if (res.ok) setNotifications(data.notifications || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" })
  }

  const remove = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await fetch(`/api/notifications/${id}`, { method: "DELETE" })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Notifications</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Notifications</h1>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">You have no notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={n.isRead ? "opacity-70" : "border-l-4 border-l-purple-500"}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{n.title}</h3>
                      {!n.isRead && (
                        <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 rounded-full px-2 py-0.5">
                          New
                        </span>
                      )}
                    </div>
                    {n.content && (
                      <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markRead(n.id)}
                        aria-label="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(n.id)}
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
