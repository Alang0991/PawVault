import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { STAFF_ROLES, roleLabel, roleDescription } from "@/lib/roles"

export const dynamic = "force-dynamic"

const ALLOWED_STAFF_ROLES = STAFF_ROLES.filter((r) => r !== "FOUNDER")

export default async function NewStaffPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/founder/staff">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to staff
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add staff member</h1>
        <p className="text-sm text-muted-foreground">
          Promote an existing user to a staff role with custom permissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Promote existing user</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/staff/create" method="POST" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email or username</label>
              <Input name="identifier" required placeholder="user@example.com or username" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select name="role" defaultValue="MODERATOR" className="w-full border rounded-md px-3 py-2 bg-background">
                {ALLOWED_STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {roleDescription("MODERATOR")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create staff</Button>
              <Button variant="outline" asChild>
                <Link href="/admin/founder/staff">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}