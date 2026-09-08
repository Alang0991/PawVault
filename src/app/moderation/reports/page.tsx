import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function ModerationReportsPage() {
  const user = await getServerUser()
  if (!user || !["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)) {
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
                You do not have permission to access this area. Only platform owners, administrators, and moderators can view this section.
              </p>
              <Button asChild className="w-full">
                <Link href="/moderation">Return to Moderation</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  let reports: any[] = []
  try {
    reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reporter: {
          select: { id: true, username: true, displayName: true, email: true },
        },
      },
    })
  } catch (error) {
    console.error("Moderation reports error:", error)
    reports = []
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Review flagged content and user reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Reports ({reports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No reports found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">
                        {report.reportedType}: {report.reportedId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reason: {report.reason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reported by {report.reporter.displayName || report.reporter.username} on{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={report.status === "PENDING" ? "destructive" : "secondary"}>
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
