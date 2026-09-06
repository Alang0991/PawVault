import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export const dynamic = "force-dynamic"

const STAFF_ROLES = ["MODERATOR", "ADMIN"] as const

export default async function StaffMemberPage({ params }: { params: { id: string } }) {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      customPermissions: true,
    },
  })

  if (!target) notFound()

  const isProtected = target.role === "FOUNDER" || target.id === user.id

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/founder/staff">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to staff
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Manage staff</h1>
        <p className="text-sm text-muted-foreground">
          {target.displayName || target.username} · {target.email}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Role</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current role:{" "}
                <Badge variant={target.role === "FOUNDER" ? "default" : "secondary"} className="text-xs">{target.role}</Badge>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isProtected ? (
            <p className="text-sm text-muted-foreground">
              {target.id === user.id
                ? "You cannot change your own role."
                : "The Founder role cannot be modified."}
            </p>
          ) : (
            <form action="/api/admin/staff/role" method="POST" className="space-y-4">
              <input type="hidden" name="userId" value={target.id} />
              <div className="space-y-2">
                <label className="text-sm font-medium">New role</label>
                <select name="role" defaultValue={target.role} className="w-full border rounded-md px-3 py-2 bg-background">
                  <option value="USER">USER (demote)</option>
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <Button type="submit">Update role</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Status: <Badge className="text-xs">{target.status}</Badge>
          </p>
          {!isProtected && (
            <form action="/api/admin/staff/status" method="POST" className="space-y-3">
              <input type="hidden" name="userId" value={target.id} />
              <Input name="reason" placeholder="Reason (required for suspensions/bans)" required />
              <div className="flex gap-2 flex-wrap">
                <Button name="action" value="ACTIVE" type="submit" variant="outline">Restore</Button>
                <Button name="action" value="SUSPENDED" type="submit" variant="outline">Suspend</Button>
                <Button name="action" value="BANNED" type="submit" variant="destructive">Ban</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
