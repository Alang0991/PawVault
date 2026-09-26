import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { BarChart3 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function FounderOrdersPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const [orders, revenueAgg] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        buyer: { select: { username: true, displayName: true, email: true } },
        items: { select: { price: true, quantity: true } },
        payments: true,
        refunds: true,
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "COMPLETED"] } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} total · ${(revenueAgg._sum.total ?? 0).toFixed(2)} revenue
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Real transactions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">${o.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.buyer?.displayName || o.buyer?.username || "guest"} · {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={o.status === "COMPLETED" || o.status === "PAID" ? "default" : "secondary"} className="text-xs">{o.status}</Badge>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <form action={`/api/admin/orders/${o.id}`} method="POST" className="flex gap-1">
                      <input type="hidden" name="_method" value="PATCH" />
                      <select name="status" defaultValue={o.status} className="text-xs border rounded px-1 py-1 bg-background">
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                      <Button type="submit" size="sm" variant="outline" className="text-xs">Update</Button>
                    </form>
                    <form action={`/api/admin/orders/${o.id}/refund`} method="POST" className="flex gap-1">
                      <Input name="amount" type="number" step="0.01" placeholder="Amount" className="text-xs w-24 h-8" required />
                      <Input name="reason" placeholder="Reason" className="text-xs w-32 h-8" />
                      <Button type="submit" size="sm" variant="destructive" className="text-xs">Refund</Button>
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
