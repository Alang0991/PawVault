import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Percent } from "lucide-react"
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
        <h1 className="text-3xl font-bold">Discounts</h1>
        <p className="text-muted-foreground">{coupons.length} coupons</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <Percent className="h-5 w-5 text-white" />
            </div>
            <CardTitle>Coupons</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No coupons yet.</p>
          ) : (
            <div className="space-y-2">
              {coupons.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{c.code}</p>
                    <p className="text-sm text-muted-foreground">{c.type} · {c.amount}</p>
                  </div>
                  <p className="text-sm">{c.usedCount} / {c.usageLimit ?? "∞"}</p>
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
