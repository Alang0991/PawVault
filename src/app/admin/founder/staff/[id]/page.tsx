import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Shield, Key, UserX } from "lucide-react"
import { STAFF_ROLES, roleLabel, roleDescription, isStaff } from "@/lib/roles"
import { PERMISSION_GROUPS, PERMISSIONS, permissionsForRole } from "@/lib/permissions"

export const dynamic = "force-dynamic"

const ALLOWED_STAFF_ROLES = STAFF_ROLES.filter((r) => r !== "FOUNDER")

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
  const basePermissions = permissionsForRole(target.role)
  const customList = (target.customPermissions ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="max-w-3xl space-y-6">
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
                <Badge variant={target.role === "FOUNDER" ? "default" : "secondary"} className="text-xs">
                  {roleLabel(target.role)}
                </Badge>
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
                  {ALLOWED_STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>{roleLabel(r)}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  {roleDescription(target.role)}
                </p>
              </div>
              <Button type="submit">Update role</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Key className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Custom permissions</CardTitle>
              <CardDescription>
                Grant or revoke individual permissions for this staff member.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isProtected ? (
            <p className="text-sm text-muted-foreground">
              Founder has all permissions by default.
            </p>
          ) : (
            <form action="/api/admin/staff/permissions" method="POST" className="space-y-4">
              <input type="hidden" name="userId" value={target.id} />
              <p className="text-xs text-muted-foreground">
                Base permissions for <b>{roleLabel(target.role)}</b>:{" "}
                {basePermissions.length} permission{basePermissions.length === 1 ? "" : "s"}.
                Comma-separated keys below override the base set.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom permissions (comma-separated)</label>
                <Input
                  name="permissions"
                  defaultValue={customList.join(", ")}
                  placeholder="e.g. users.view, products.feature"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use role defaults. Add keys to grant extra permissions.
                  Remove keys from the list to revoke them.
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {PERMISSION_GROUPS.map((group) =>
                  group.permissions.map((p) => {
                    const isBase = basePermissions.includes(p.key)
                    const isCustom = customList.includes(p.key)
                    return (
                      <Badge
                        key={p.key}
                        variant={isCustom ? "default" : isBase ? "secondary" : "outline"}
                        className="text-xs cursor-help"
                        title={p.description}
                      >
                        {p.key}
                      </Badge>
                    )
                  }),
                )}
              </div>
              <Button type="submit">Save permissions</Button>
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
              <Input name="reason" placeholder="Reason (required for suspensions/bans)" />
              <div className="flex gap-2 flex-wrap">
                <Button name="action" value="ACTIVE" type="submit" variant="outline">Restore</Button>
                <Button name="action" value="SUSPENDED" type="submit" variant="outline">Suspend</Button>
                <Button name="action" value="BANNED" type="submit" variant="destructive">
                  <UserX className="h-3 w-3 mr-1" />Ban
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="flex">
        <Button variant="ghost" asChild>
          <Link href="/admin/founder/staff">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to staff
          </Link>
        </Button>
      </div>
    </div>
  )
}