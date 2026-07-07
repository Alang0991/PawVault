import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
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
import { ArrowLeft, Shield } from "lucide-react"

export const dynamic = "force-dynamic"

const ALLOWED_ROLES = [
  "USER",
  "CREATOR",
  "VERIFIED_CREATOR",
  "MODERATOR",
  "ADMIN",
  "OWNER",
] as const

interface UserPageProps {
  params: { id: string }
}

export default async function ModerationUserPage({ params }: UserPageProps) {
  const user = await getServerUser()
  if (!user || !["ADMIN", "OWNER"].includes(user.role)) {
    redirect("/moderation")
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  })

  if (!targetUser) {
    notFound()
  }

  const canAssignAdminOrOwner = user.role === "OWNER"
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
                  Current role: <Badge variant={targetUser.role === "OWNER" ? "default" : "secondary"}>{targetUser.role}</Badge>
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
                      <SelectItem key={r} value={r} disabled={!canAssignAdminOrOwner && ["ADMIN", "OWNER"].includes(r)}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!canAssignAdminOrOwner && (
                  <p className="text-xs text-muted-foreground">
                    Only the platform owner can assign ADMIN or OWNER roles.
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
