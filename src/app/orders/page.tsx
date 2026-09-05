export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ShoppingBag,
  ArrowRight,
} from "lucide-react"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING: 'secondary',
    PROCESSING: 'secondary',
    PAID: 'default',
    COMPLETED: 'default',
    FAILED: 'destructive',
    CANCELLED: 'secondary',
    REFUNDED: 'outline',
    PARTIALLY_REFUNDED: 'outline',
    DISPUTED: 'destructive',
  }
  return <Badge variant={map[status] ?? 'secondary'}>{status}</Badge>
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: {
      creator: { select: { id: true, username: true, displayName: true } },
      items: {
        include: {
          product: {
            include: {
              media: { where: { isThumbnail: true }, take: 1 },
              creator: { select: { id: true, username: true, displayName: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">My Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">View your order history</p>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start browsing to find amazing digital products
              </p>
              <Button className="gradient-bg text-white" asChild>
                <Link href="/browse">
                  Browse Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/orders/${order.id}`} className="hover:text-purple-600 transition-colors">
                          Order #{order.id.slice(0, 8)}
                        </Link>
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                          {item.product.media[0] ? (
                            <img
                              src={item.product.media[0].url}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{item.product.title}</h3>
                              <p className="text-sm text-gray-500">
                                by {item.product.creator.displayName || item.product.creator.username}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${item.price.toFixed(2)}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div className="text-sm text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold">Total: ${order.total.toFixed(2)}</div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/orders/${order.id}`}>
                          View Details <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
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