import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function StaffPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: ["MODERATOR", "ADMIN", "FOUNDER"] } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      isVerified: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff / Team</h1>
          <p className="text-muted-foreground">Moderators, admins, and the Founder</p>
        </div>
        <Button asChild>
          <Link href="/admin/founder/staff/new">Add moderator</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Active staff ({staff.length})</CardTitle>
              <CardDescription>Only the Founder can add or remove staff</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No staff yet.</p>
          ) : (
            <div className="space-y-3">
              {staff.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{s.displayName || s.username}</p>
                    <p className="text-sm text-muted-foreground">{s.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.role === "FOUNDER" ? "default" : s.role === "ADMIN" ? "secondary" : "outline"}>
                      {s.role}
                    </Badge>
                    {s.status !== "ACTIVE" && (
                      <Badge variant="destructive">{s.status}</Badge>
                    )}
                    <Link href={`/admin/founder/staff/${s.id}`}>
                      <Button size="sm" variant="outline">Manage</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex">
        <Button variant="ghost" asChild>
          <Link href="/admin/founder">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to overview
          </Link>
        </Button>
      </div>
    </div>
  )
}
