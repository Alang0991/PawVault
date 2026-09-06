import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Users } from "lucide-react"

export const dynamic = "force-dynamic"

const STAFF_ROLES = ["USER", "CREATOR", "VERIFIED_CREATOR", "MODERATOR", "ADMIN"] as const

export default async function FounderUsersPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      role: true,
      status: true,
      isVerified: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">{users.length} real accounts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <CardTitle>All users</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No users yet.</p>
          ) : (
            <div className="space-y-4">
              {users.map((u) => (
                <div key={u.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{u.displayName || u.username}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={u.role === "FOUNDER" ? "default" : u.role === "ADMIN" ? "secondary" : "outline"}>
                        {u.role}
                      </Badge>
                      {u.status !== "ACTIVE" && (
                        <Badge variant="destructive">{u.status}</Badge>
                      )}
                    </div>
                  </div>
                  {u.role !== "FOUNDER" && u.id !== user.id && (
                    <div className="flex flex-col gap-2">
                      <form action="/api/admin/staff/role" method="POST" className="flex gap-1">
                        <input type="hidden" name="userId" value={u.id} />
                        <select name="role" defaultValue={u.role} className="text-xs border rounded px-1 py-1 bg-background">
                          {STAFF_ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <Button type="submit" size="sm" variant="outline" className="text-xs">Role</Button>
                      </form>
                      <form action="/api/admin/staff/status" method="POST" className="flex gap-1">
                        <input type="hidden" name="userId" value={u.id} />
                        <Input name="reason" placeholder="Reason" className="text-xs w-24 h-8" required />
                        <div className="flex gap-1">
                          <Button name="action" value="ACTIVE" type="submit" size="sm" variant="outline" className="text-xs">Restore</Button>
                          <Button name="action" value="SUSPENDED" type="submit" size="sm" variant="outline" className="text-xs">Suspend</Button>
                          <Button name="action" value="BANNED" type="submit" size="sm" variant="destructive" className="text-xs">Ban</Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}
