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

const ROLE_FILTERS = ["USER", "CREATOR", "VERIFIED_CREATOR", "MODERATOR", "ADMIN", "FOUNDER"] as const
const STATUS_FILTERS = ["ACTIVE", "SUSPENDED", "BANNED"] as const

export default async function FounderUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; status?: string }
}) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const where: any = {}
  if (searchParams.q) {
    where.OR = [
      { username: { contains: searchParams.q, mode: "insensitive" } },
      { displayName: { contains: searchParams.q, mode: "insensitive" } },
      { email: { contains: searchParams.q, mode: "insensitive" } },
    ]
  }
  if (searchParams.role) {
    where.role = searchParams.role
  }
  if (searchParams.status) {
    where.status = searchParams.status
  }

  const users = await prisma.user.findMany({
    where,
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
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} real accounts</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle className="text-base">Search and filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium">Search</label>
              <Input name="q" defaultValue={searchParams.q || ""} placeholder="Name, username, email..." className="w-56" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Role</label>
              <select name="role" defaultValue={searchParams.role || ""} className="border rounded-md px-2 py-1.5 text-sm bg-background">
                <option value="">All</option>
                {ROLE_FILTERS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Status</label>
              <select name="status" defaultValue={searchParams.status || ""} className="border rounded-md px-2 py-1.5 text-sm bg-background">
                <option value="">All</option>
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm">Apply</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle className="text-base">All users</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No users match your filters.</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{u.displayName || u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={u.role === "FOUNDER" ? "default" : u.role === "ADMIN" ? "secondary" : "outline"} className="text-xs">
                        {u.role}
                      </Badge>
                      {u.status !== "ACTIVE" && (
                        <Badge variant="destructive" className="text-xs">{u.status}</Badge>
                      )}
                      {u.isVerified && (
                        <Badge variant="outline" className="text-xs">Verified</Badge>
                      )}
                    </div>
                  </div>
                  {u.role !== "FOUNDER" && u.id !== user.id && (
                    <div className="flex flex-col gap-2">
                      <form action="/api/admin/staff/role" method="POST" className="flex gap-1">
                        <input type="hidden" name="userId" value={u.id} />
                        <select name="role" defaultValue={u.role} className="text-xs border rounded px-1 py-1 bg-background">
                          {ROLE_FILTERS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <Button type="submit" size="sm" variant="outline" className="text-xs">Role</Button>
                      </form>
                      <form action="/api/admin/staff/status" method="POST" className="flex gap-1">
                        <input type="hidden" name="userId" value={u.id} />
                        <Input name="reason" placeholder="Reason" className="text-xs w-28 h-7" required />
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
