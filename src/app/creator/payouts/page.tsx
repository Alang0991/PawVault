import { prisma } from "@/lib/db"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatPrice, formatDate } from "@/lib/helpers"
import Link from "next/link"

export default async function PayoutsPage() {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const payouts = await prisma.payout.findMany({
    where: { creatorId: user.id },
    orderBy: { createdAt: "desc" },
  })

  const totalPaid = payouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingPayouts = payouts
    .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Payout History</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg">Total Paid</CardTitle>
              <p className="text-2xl font-bold mt-2">{formatPrice(totalPaid)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg">Pending</CardTitle>
              <p className="text-2xl font-bold mt-2">{formatPrice(pendingPayouts)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="text-lg">Total Payouts</CardTitle>
              <p className="text-2xl font-bold mt-2">{payouts.length}</p>
            </CardContent>
          </Card>
        </div>

        {payouts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No payouts yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payouts.map((payout) => (
              <Card key={payout.id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formatPrice(payout.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payout.createdAt)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Method: {payout.method}
                    </p>
                  </div>
                  <Badge variant={
                    payout.status === "PAID" ? "default" :
                    payout.status === "FAILED" ? "destructive" : "secondary"
                  }>
                    {payout.status}
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
