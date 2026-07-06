import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDate } from "@/lib/helpers"

export const dynamic = "force-dynamic"

export default async function CreatorCustomersPage() {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const licenses = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: { creatorId: user.id },
        },
      },
    },
    include: {
      buyer: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
        },
      },
      items: {
        where: {
          product: { creatorId: user.id },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const customerMap = new Map()
  licenses.forEach((order) => {
    if (!order.buyer) return
    if (!customerMap.has(order.buyer.id)) {
      customerMap.set(order.buyer.id, {
        user: order.buyer,
        licenses: 0,
        totalSpent: 0,
      })
    }
    const customer = customerMap.get(order.buyer.id)
    customer.licenses += 1
    customer.totalSpent += order.total
  })

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Customers</h1>
        {customerMap.size === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No customers yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Array.from(customerMap.values()).map((customer) => (
              <Card key={customer.user.id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{customer.user.displayName || customer.user.email}</p>
                    <p className="text-sm text-muted-foreground">@{customer.user.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{customer.licenses} licenses</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(customer.totalSpent)} total</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
