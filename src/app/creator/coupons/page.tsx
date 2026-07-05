import { prisma } from "@/lib/db"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/helpers"
import Link from "next/link"

export default async function CreatorCouponsPage() {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const coupons = await prisma.coupon.findMany({
    where: { creatorId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Coupons</h1>
          <Button asChild>
            <Link href="/creator/coupons/new">Create Coupon</Link>
          </Button>
        </div>
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No coupons yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-lg">{coupon.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {coupon.type === "percentage" ? `${coupon.amount}% off` : `${formatPrice(coupon.amount)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Used {coupon.usedCount} / {coupon.usageLimit || "unlimited"} times
                    </p>
                  </div>
                  <Badge variant={coupon.expiresAt && coupon.expiresAt < new Date() ? "destructive" : "default"}>
                    {coupon.expiresAt && coupon.expiresAt < new Date() ? "Expired" : "Active"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
