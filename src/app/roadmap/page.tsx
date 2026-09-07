import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react"

export const dynamic = "force-dynamic"

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

export default async function RoadmapPage() {
  const user = await getServerUser()

  const items = await prisma.roadmapItem.findMany({
    orderBy: [
      { priority: "desc" },
      { createdAt: "desc" },
    ],
    take: 100,
  })

  const grouped = items.reduce(
    (acc, item) => {
      const status = item.status
      if (!acc[status]) acc[status] = []
      acc[status].push(item)
      return acc
    },
    {} as Record<string, typeof items>
  )

  const isStaff = user && ["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Roadmap</h1>
              <p className="text-sm text-text-secondary mt-1">
                What we&apos;re building and where we&apos;re headed.
              </p>
            </div>
            {isStaff && (
              <Button asChild>
                <Link href="/admin/founder/roadmap">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Roadmap
                </Link>
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-10 w-10 mx-auto mb-4 text-text-muted" />
                <p className="text-text-secondary">No roadmap items yet.</p>
                {isStaff && (
                  <Button asChild className="mt-4">
                    <Link href="/admin/founder/roadmap">
                      Create your first roadmap item
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
                        {config.label}
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
                                {item.priority}
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
