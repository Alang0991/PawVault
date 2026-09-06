import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PERMISSION_GROUPS } from "@/lib/permissions"
import Link from "next/link"
import { ScrollText } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function FounderPermissionsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Permissions</h1>
        <p className="text-muted-foreground">Reference: which roles have which permissions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {PERMISSION_GROUPS.map((group) => (
          <Card key={group.label}>
            <CardHeader>
              <CardTitle>{group.label}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {group.permissions.map((p) => (
                <div key={p.key} className="flex items-start gap-2 text-sm">
                  <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded">{p.key}</code>
                  <span className="text-muted-foreground">{p.description}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ScrollText className="h-5 w-5" />
            <CardTitle>Role baseline</CardTitle>
          </div>
          <CardDescription>Founder has every permission. Admin has most. Moderator is moderation-only.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><b>FOUNDER</b> — all permissions.</p>
          <p><b>ADMIN</b> — all except staff.manage.</p>
          <p><b>MODERATOR</b> — moderation tools only.</p>
          <p><b>CREATOR</b> — own products, own store.</p>
          <p><b>USER</b> — buy, review, follow.</p>
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}
