import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          {orders.length} total · ${(revenueAgg._sum.total ?? 0).toFixed(2)} revenue
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <CardTitle>Real transactions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">${o.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {o.buyer?.displayName || o.buyer?.username || "guest"} · {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={o.status === "COMPLETED" || o.status === "PAID" ? "default" : "secondary"}>{o.status}</Badge>
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
