export const dynamic = 'force-dynamic'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { RefundRequestForm } from "@/components/refund-request-form"
import {
  Download,
  ExternalLink,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react"
import Image from "next/image"

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

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { id: true, username: true, displayName: true } },
      items: {
        include: {
          product: {
            include: {
              media: { where: { isThumbnail: true }, take: 1 },
              creator: { select: { id: true, username: true, displayName: true } },
              files: true,
            },
          },
        },
      },
      payments: true,
      refunds: true,
      disputes: true,
      licenses: true,
    },
  })

  if (!order) {
    notFound()
  }

  if (order.buyerId !== session.user.id) {
    const isCreator = order.creatorId === session.user.id
    if (!isCreator) {
      redirect("/orders")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="space-y-6">
          {order.items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      {item.product.media[0] ? (
                        <Image
                          src={item.product.media[0].url}
                          alt={item.product.title}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.product.title}</CardTitle>
                      <p className="text-sm text-gray-500">
                        by {item.product.creator.displayName || item.product.creator.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {order.status === 'PAID' || order.status === 'COMPLETED' ? (
                  <div className="flex gap-2">
                    {item.product.files && item.product.files.length > 0 && (
                      <Button size="sm" className="gradient-bg text-white" asChild>
                        <a href={`/api/products/files/${item.product.files[0].id}/download`}>
                          <Download className="h-4 w-4 mr-1" /> Download
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/product/${item.product.slug}`}>
                        <ExternalLink className="h-4 w-4 mr-1" /> View Product
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                <span>${order.applicationFeeAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{order.currency} {order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {order.status === 'PAID' || order.status === 'COMPLETED' ? (
            <RefundRequestForm
              order={{
                id: order.id,
                orderNumber: order.id.slice(0, 8).toUpperCase(),
                status: order.status,
                total: order.total,
                currency: order.currency,
                createdAt: order.createdAt.toISOString(),
                items: order.items.map((item) => ({
                  id: item.id,
                  title: item.product.title,
                  slug: item.product.slug,
                  price: item.price,
                  salePrice: item.product.salePrice,
                  isFree: item.product.isFree,
                })),
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}