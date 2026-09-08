import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ModerationUsersPage() {
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

  const canAssignAdminOrFounder = user.role === "FOUNDER"
  const isFounder = user.role === "FOUNDER"

  let users: any[] = []
  try {
    users = await prisma.user.findMany({
      where: {
        ...(!isFounder && { isInternal: false }),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        status: true,
        isVerified: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error("Moderation users error:", error)
    users = []
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage platform users and roles</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users found.</p>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{u.displayName || u.username}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={u.role === "FOUNDER" ? "default" : u.role === "ADMIN" ? "secondary" : "outline"}>
                        {u.role}
                      </Badge>
                      {u.status !== "ACTIVE" && (
                        <Badge variant="destructive">{u.status}</Badge>
                      )}
                      {u.isVerified && <Badge variant="secondary">Verified</Badge>}
                      <Link href={`/moderation/users/${u.id}`}>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </Link>
                    </div>
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
