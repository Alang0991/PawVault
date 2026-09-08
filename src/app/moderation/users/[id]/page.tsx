import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

const ALLOWED_ROLES = [
  "USER",
  "CREATOR",
  "VERIFIED_CREATOR",
  "MODERATOR",
  "ADMIN",
  "FOUNDER",
] as const

interface UserPageProps {
  params: { id: string }
}

export default async function ModerationUserPage({ params }: UserPageProps) {
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

  const isFounder = user.role === "FOUNDER"

  const targetUser = await prisma.user.findUnique({
    where: { id: params.id, ...(!isFounder && { isInternal: false }) },
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

  if (!targetUser) {
    notFound()
  }

  const canAssignAdminOrFounder = user.role === "FOUNDER"
  const isSelf = targetUser.id === user.id

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/moderation/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Manage User</h1>
          <p className="text-muted-foreground">
            {targetUser.displayName || targetUser.username} · {targetUser.email}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Role Assignment</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Current role: <Badge variant={targetUser.role === "FOUNDER" ? "default" : "secondary"}>{targetUser.role}</Badge>
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={`/api/admin/users/${targetUser.id}/role`} method="POST" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Role</label>
                <Select name="role" defaultValue={targetUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWED_ROLES.map((r) => (
                      <SelectItem key={r} value={r} disabled={!canAssignAdminOrFounder && ["ADMIN", "FOUNDER"].includes(r)}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!canAssignAdminOrFounder && (
                  <p className="text-xs text-muted-foreground">
                    Only the Founder can assign ADMIN or FOUNDER roles.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit">Update Role</Button>
                <Button asChild variant="outline">
                  <Link href="/moderation/users">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
