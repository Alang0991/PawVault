"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface RoadmapItem {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  createdAt: string
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: any; icon: any }
> = {
  PLANNED: {
    label: "Planned",
    variant: "secondary",
    icon: Target,
  },
  IN_PROGRESS: {
    label: "In Progress",
    variant: "default",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    variant: "default",
    icon: CheckCircle2,
  },
  ON_HOLD: {
    label: "On Hold",
    variant: "outline",
    icon: AlertCircle,
  },
}

export default function RoadmapPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [itemsRes, userRes] = await Promise.all([
          fetch("/api/roadmap"),
          fetch("/api/auth/user"),
        ])
        if (itemsRes.ok) {
          const data = await itemsRes.json()
          setItems(data.items || [])
        }
        if (userRes.ok) {
          const userData = await userRes.json()
          setIsStaff(userData.user && ["ADMIN", "FOUNDER", "MODERATOR"].includes(userData.user.role))
        }
      } catch (err) {
        console.error("Failed to load roadmap:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grouped = items.reduce(
    (acc, item) => {
      const status = item.status
      if (!acc[status]) acc[status] = []
      acc[status].push(item)
      return acc
    },
    {} as Record<string, typeof items>
  )

  const statusLabels: Record<string, string> = {
    PLANNED: t("roadmap.status.planned"),
    IN_PROGRESS: t("roadmap.status.inProgress"),
    COMPLETED: t("roadmap.status.completed"),
    ON_HOLD: t("roadmap.status.onHold"),
  }

  const priorityLabels: Record<string, string> = {
    HIGH: t("roadmap.priority.high"),
    CRITICAL: t("roadmap.priority.critical"),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-6 bg-muted rounded w-1/3" />
                    {[...Array(3)].map((_, j) => (
                      <Card key={j} className="h-32" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{t("roadmap.title")}</h1>
              <p className="text-sm text-text-secondary mt-1">{t("roadmap.subtitle")}</p>
            </div>
            {isStaff && (
              <Button asChild>
                <Link href="/admin/founder/roadmap">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("roadmap.manage")}
                </Link>
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-10 w-10 mx-auto mb-4 text-text-muted" />
                <p className="text-text-secondary">{t("roadmap.empty")}</p>
                {isStaff && (
                  <Button asChild className="mt-4">
                    <Link href="/admin/founder/roadmap">
                      {t("roadmap.createFirst")}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                const statusItems = grouped[status] || []
                const Icon = config.icon

                return (
                  <div key={status} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-text-muted" />
                      <h2 className="font-semibold text-sm uppercase tracking-wider text-text-muted">
                        {statusLabels[status] || config.label}
                      </h2>
                      <Badge variant={config.variant} className="text-xs">
                        {statusItems.length}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {statusItems.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <h3 className="font-medium text-sm mb-2 text-text-primary">
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-xs text-text-secondary mb-3 line-clamp-3">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  item.priority === "HIGH" || item.priority === "CRITICAL"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {priorityLabels[item.priority] || item.priority}
                              </Badge>
                              <span className="text-xs text-text-muted">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}