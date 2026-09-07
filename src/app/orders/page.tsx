export const dynamic = "force-dynamic"

import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { formatDate, formatPrice } from "@/lib/helpers"
import { ShoppingBag, ArrowRight, Package } from "lucide-react"

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "error" | "info" | "sale" | "price" | "subtle" | null | undefined> = {
    PENDING: "warning",
    PROCESSING: "info",
    PAID: "success",
    COMPLETED: "success",
    FAILED: "error",
    CANCELLED: "subtle",
    REFUNDED: "secondary",
    PARTIALLY_REFUNDED: "warning",
    DISPUTED: "error",
  }
  const label = status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")
  return <Badge variant={map[status] ?? "subtle"}>{label}</Badge>
}

export default async function OrdersPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: {
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
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">My Orders</h1>
          <p className="text-sm text-text-secondary mt-1">
            {orders.length === 0
              ? "Order history will appear here."
              : `${orders.length} order${orders.length === 1 ? "" : "s"} total`}
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
              <ShoppingBag className="h-7 w-7 text-text-muted" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              No orders yet
            </h2>
            <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
              Start browsing to find digital products from creators you'll love.
            </p>
            <Button asChild>
              <Link href="/browse">Browse Marketplace</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">
                        <Link
                          href={`/orders/${order.id}`}
                          className="hover:text-accent transition-colors"
                        >
                          Order #{order.id.slice(0, 8)}
                        </Link>
                      </CardTitle>
                      <p className="text-sm text-text-muted">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => {
                      const product = item.product
                      const thumbnail = product.media?.[0]
                      const creatorName =
                        product.creator.displayName || product.creator.username

                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-4"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded border bg-surface-subtle">
                            {thumbnail ? (
                              <AdultContentPreview
                                mediaId={thumbnail.id}
                                directUrl={thumbnail.url}
                                contentRating="SFW"
                                alt={product.title}
                                variant="image"
                                className="h-16 w-16"
                                imgClassName="h-16 w-16 object-cover"
                                showBadge={false}
                              />
                            ) : (
                              <div className="h-16 w-16 flex items-center justify-center text-text-muted">
                                <Package className="h-5 w-5 opacity-30" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-text-primary line-clamp-1">
                                  {product.title}
                                </p>
                                <p className="text-xs text-text-secondary">
                                  by {creatorName}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-text-primary">
                                  {formatPrice(item.price!)}
                                </p>
                                <p className="text-xs text-text-muted">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t mt-4 text-sm">
                    <span className="text-text-secondary">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary">Total:</span>
                      <span className="font-bold text-text-primary">
                        {formatPrice(order.total)}
                      </span>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/orders/${order.id}`}>
                          View Details
                          <ArrowRight className="ml-1 h-4 w-4" />
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
