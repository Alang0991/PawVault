import { prisma } from "@/lib/db"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { formatPrice } from "@/lib/helpers"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function CreatorLicensesPage() {
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
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Customer Licenses</h1>
        {licenses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No licenses yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {licenses.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">
                        {order.items[0]?.product.title || "License"}
                        {order.items.length > 1 ? ` and ${order.items.length - 1} more` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.buyer?.displayName || order.buyer?.email || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.total)}</p>
                      <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-t">
                      <p className="text-sm">{item.product.title} x{item.quantity}</p>
                      <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
