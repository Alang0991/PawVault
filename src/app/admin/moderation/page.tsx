export const dynamic = "force-dynamic"

import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, XCircle, Users, FileText, MessageSquare } from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  type: 'asset' | 'user' | 'review' | 'message'
  reason: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: string
  reporter: {
    username: string
    email: string
  }
  target: {
    id: string
    title?: string
    username?: string
  }
}

export default async function ModerationPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  if (!["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
        <div className="container mx-auto px-4 max-w-xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <CardTitle>Access Denied</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You do not have permission to access moderation tools. Only platform owners, administrators, and moderators can view this area.
              </p>
              <Button asChild className="w-full">
                <Link href="/">Return Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  let reports: Report[] = []
  try {
    const dbReports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reporter: { select: { username: true, displayName: true } },
      },
    })
    reports = dbReports.map((r: any) => ({
      id: r.id,
      type: r.reportedType as Report['type'],
      reason: r.reason,
      status: r.status as Report['status'],
      createdAt: r.createdAt.toISOString(),
      reporter: {
        username: r.reporter?.username || "",
        email: r.reporter?.displayName || "",
      },
      target: { id: r.reportedId, type: r.reportedType, title: r.reportedId },
    }))
  } catch (error) {
    console.error("Moderation reports error:", error)
  }

  const stats = {
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage reported content and users</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-sky-100 text-sky-600 rounded-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reviewed</p>
                <p className="text-2xl font-bold">{stats.reviewed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dismissed</p>
                <p className="text-2xl font-bold">{stats.dismissed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({stats.reviewed})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed ({stats.dismissed})</TabsTrigger>
            <TabsTrigger value="all">All ({reports.length})</TabsTrigger>
          </TabsList>

          {(['pending', 'reviewed', 'resolved', 'dismissed', 'all'] as const).map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              {reports.filter(r => tabValue === 'all' || r.status === tabValue).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No reports found.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reports
                    .filter(r => tabValue === 'all' || r.status === tabValue)
                    .map((report) => (
                      <Card key={report.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={
                                  report.type === 'asset' ? 'default' :
                                  report.type === 'user' ? 'secondary' :
                                  report.type === 'review' ? 'outline' : 'destructive'
                                }>
                                  {report.type}
                                </Badge>
                                <Badge variant={
                                  report.status === 'pending' ? 'secondary' :
                                  report.status === 'resolved' ? 'default' : 'destructive'
                                }>
                                  {report.status}
                                </Badge>
                              </div>
                              <h3 className="font-semibold mb-1">{report.reason}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Reported by {report.reporter.username || report.reporter.email}
                              </p>
                              <p className="text-sm">
                                Target: {report.target.title || report.target.username || report.target.id}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(report.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="py-2"></div>

        <div className="flex gap-2">
          <Link href="/moderation">
            <Button variant="ghost">← Back to Moderation</Button>
          </Link>
          <Link href="/moderation/reports">
            <Button variant="outline">Go to Reports →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
