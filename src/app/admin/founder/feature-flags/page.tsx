import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { Flag, ToggleLeft, ToggleRight, Plus, Trash2, Users as UsersIcon } from "lucide-react"

export const dynamic = "force-dynamic"

const ENVIRONMENTS = ["production", "staging", "development"] as const

export default async function FounderFeatureFlagsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let flags: any[] = []
  try {
    flags = await prisma.featureFlag.findMany({
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Failed to fetch feature flags:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feature Flags</h1>
        <p className="text-sm text-muted-foreground">
          Toggle beta features, manage rollouts, and control website-wide settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Flag className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create feature flag</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/feature-flags" method="POST" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Key</Label>
                <Input name="key" required placeholder="e.g. new_checkout" />
              </div>
              <div className="space-y-1">
                <Label>Name</Label>
                <Input name="name" required placeholder="Display name" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea name="description" placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Environment</Label>
                <select name="environment" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  {ENVIRONMENTS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Rollout (%)</Label>
                <Input name="rolloutPercent" type="number" min="0" max="100" defaultValue="0" />
              </div>
              <div className="space-y-1">
                <Label>Display order</Label>
                <Input name="displayOrder" type="number" defaultValue="0" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch name="enabled" defaultChecked />
              <Label>Enabled</Label>
            </div>
            <Button type="submit" size="sm">Create flag</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Flag className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Active flags ({flags.filter((f) => f.enabled).length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {flags.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No feature flags configured.</p>
          ) : (
            <div className="space-y-3">
              {flags.map((f) => (
                <div key={f.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.key} · {f.environment} · rollout {f.rolloutPercent}%
                      </p>
                      {f.description && <p className="text-xs text-muted-foreground mt-1">{f.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={f.enabled ? "default" : "secondary"} className="text-xs">
                        {f.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <form action="/api/admin/feature-flags" method="POST" className="flex gap-1">
                        <input type="hidden" name="flagId" value={f.id} />
                        <input type="hidden" name="enabled" value={f.enabled ? "false" : "true"} />
                        <Button type="submit" size="sm" variant="outline" className="text-xs">
                          {f.enabled ? "Disable" : "Enable"}
                        </Button>
                      </form>
                      <form action="/api/admin/feature-flags" method="POST">
                        <input type="hidden" name="_method" value="DELETE" />
                        <input type="hidden" name="flagId" value={f.id} />
                        <Button type="submit" size="sm" variant="destructive" className="text-xs">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rollout guidance</CardTitle>
          <CardDescription>How feature flags work.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• 0% rollout = hidden to all users.</p>
          <p>• 100% rollout = visible to all users.</p>
          <p>• Intermediate values use deterministic user-ID hashing.</p>
          <p>• Target roles/users can override the percentage.</p>
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}