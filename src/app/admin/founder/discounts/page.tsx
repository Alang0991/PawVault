import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function FounderDiscountsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Discounts</h1>
        <p className="text-sm text-muted-foreground">{coupons.length} coupons</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Percent className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Create coupon</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/coupons" method="POST" className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium">Code</label>
              <Input name="code" required placeholder="SAVE20" className="w-32" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Type</label>
              <select name="type" className="text-xs border rounded px-2 py-1.5 bg-background">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Amount</label>
              <Input name="amount" type="number" step="0.01" required placeholder="20" className="w-20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Min purchase</label>
              <Input name="minPurchase" type="number" step="0.01" placeholder="Optional" className="w-24" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Usage limit</label>
              <Input name="usageLimit" type="number" placeholder="Optional" className="w-20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Expires</label>
              <Input name="expiresAt" type="datetime-local" className="w-44" />
            </div>
            <Button type="submit" size="sm">Create</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Percent className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Coupons</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No coupons yet.</p>
          ) : (
            <div className="space-y-2">
              {coupons.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{c.code}</p>
                    <p className="text-xs text-muted-foreground">{c.type} · {c.amount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{c.usedCount} / {c.usageLimit ?? "∞"}</span>
                    <form action={`/api/admin/coupons/${c.id}`} method="POST" className="flex gap-1">
                      <input type="hidden" name="_method" value="PUT" />
                      <Input name="code" defaultValue={c.code} className="text-xs w-24 h-8" />
                      <select name="type" defaultValue={c.type} className="text-xs border rounded px-1 py-1 bg-background">
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                      </select>
                      <Input name="amount" type="number" step="0.01" defaultValue={c.amount} className="text-xs w-16 h-8" />
                      <Button type="submit" size="sm" variant="outline" className="text-xs">Update</Button>
                    </form>
                    <form action={`/api/admin/coupons/${c.id}`} method="POST">
                      <input type="hidden" name="_method" value="DELETE" />
                      <Button type="submit" size="sm" variant="destructive" className="text-xs">Delete</Button>
                    </form>
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
