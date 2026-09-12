import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { Scale, Gavel, Shield, Plus, Trash2 } from "lucide-react"

export const dynamic = "force-dynamic"

const RULE_TYPES = ["CONTENT", "PRICING", "SHIPPING", "TAX", "COMMISSION", " Moderation"] as const

export default async function FounderRulesPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let rules: any[] = []
  try {
    rules = await prisma.marketplaceRule.findMany({
      orderBy: [{ isActive: "desc" }, { priority: "asc" }],
    })
  } catch (error) {
    console.error("Failed to fetch marketplace rules:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace Rules</h1>
        <p className="text-sm text-muted-foreground">
          Define platform rules, fees, and moderation policies.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Scale className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create rule</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/rules" method="POST" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Rule type</Label>
                <select name="ruleType" className="w-full border rounded-md px-3 py-2 bg-background text-sm">
                  {RULE_TYPES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Scope</Label>
                <Input name="scope" placeholder="global, category, creator..." />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input name="name" required placeholder="Rule name" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea name="description" placeholder="Optional description" />
            </div>
            <div className="space-y-1">
              <Label>Priority (lower = higher)</Label>
              <Input name="priority" type="number" defaultValue="0" />
            </div>
            <div className="flex items-center gap-2">
              <Switch name="isActive" defaultChecked />
              <Label>Active</Label>
            </div>
            <Button type="submit" size="sm">Create</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Gavel className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Active rules ({rules.filter((r) => r.isActive).length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No rules configured.</p>
          ) : (
            <div className="space-y-3">
              {rules.map((r) => (
                <div key={r.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.ruleType} · {r.scope} · priority {r.priority}
                      </p>
                      {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.isActive ? "default" : "secondary"} className="text-xs">
                        {r.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <form action={`/api/admin/rules/${r.id}`} method="POST">
                        <input type="hidden" name="_method" value="DELETE" />
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

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}