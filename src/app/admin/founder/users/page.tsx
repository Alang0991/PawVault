import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users } from "lucide-react"

export const dynamic = "force-dynamic"

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
            <p className="text-muted-foreground text-center py-8">No users yet. PawVault is just getting started.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{u.displayName || u.username}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "FOUNDER" ? "default" : u.role === "ADMIN" ? "secondary" : "outline"}>
                      {u.role}
                    </Badge>
                    {u.status !== "ACTIVE" && (
                      <Badge variant="destructive">{u.status}</Badge>
                    )}
                  </div>
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
