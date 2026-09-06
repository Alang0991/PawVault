import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

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
        <h1 className="text-3xl font-bold">Add moderator</h1>
        <p className="text-muted-foreground">Promote an existing user to a staff role.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promote existing user</CardTitle>
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
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
              <p className="text-xs text-muted-foreground">Founder role cannot be granted via this UI.</p>
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
