export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Loader2, ExternalLink, Download, ShoppingBag } from 'lucide-react'

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

async function OrderGroupContent({ orderGroupId }: { orderGroupId: string }) {
  const orderGroup = await prisma.orderGroup.findUnique({
    where: { id: orderGroupId },
    include: {
      orders: {
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
      },
    },
  })

  if (!orderGroup) notFound()

  const isPaid = orderGroup.orders.every((o) => ['PAID', 'COMPLETED'].includes(o.status))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            {isPaid ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            )}
            <div>
              <h1 className="text-3xl font-bold">
                {isPaid ? 'Payment Successful' : 'Payment Processing'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isPaid
                  ? 'Your order is confirmed. Downloads are available below.'
                  : 'We are confirming your payment. Please do not close this page.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {orderGroup.orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(0, 8)}
                        {order.creator && (
                          <span className="text-gray-500 font-normal text-base ml-2">
                            — {order.creator.displayName || order.creator.username}
                          </span>
                        )}
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
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
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
                          <p className="font-semibold">{item.product.title}</p>
                          <p className="text-sm text-gray-500">
                            {item.product.creator.displayName || item.product.creator.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div className="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                    <div className="text-lg font-bold">Total: ${order.total.toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isPaid && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="gradient-bg text-white">
                    <Link href="/library">
                      <Download className="h-4 w-4 mr-2" /> Go to Library
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/orders">
                      <ShoppingBag className="h-4 w-4 mr-2" /> View All Orders
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/browse">
                      <ExternalLink className="h-4 w-4 mr-2" /> Continue Browsing
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage({ searchParams }: { searchParams: { order_id?: string; session_id?: string } }) {
  const orderGroupId = searchParams?.order_id

  if (!orderGroupId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No order found</h3>
              <p className="text-gray-500 mb-6">We could not find a valid order for this checkout session.</p>
              <Button asChild className="gradient-bg text-white">
                <Link href="/browse">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        </div>
      }
    >
      <OrderGroupContent orderGroupId={orderGroupId} />
    </Suspense>
  )
}