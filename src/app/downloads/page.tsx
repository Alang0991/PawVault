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
  Download,
  ExternalLink,
  Package,
} from "lucide-react"

export default async function DownloadsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const completedOrders = await prisma.order.findMany({
    where: { 
      buyerId: session.user.id,
      status: "COMPLETED"
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              creator: true,
              media: {
                where: { isThumbnail: true },
                take: 1
              },
              files: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Flatten all products from completed orders
  const downloadableProducts = completedOrders.flatMap(order => 
    order.items.map(item => ({
      ...item.product,
      orderId: order.id,
      orderDate: order.createdAt,
      price: item.price
    }))
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">My Downloads</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Access all your purchased digital products</p>

        {downloadableProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No downloads available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Complete a purchase to access your downloads
              </p>
              <Button className="gradient-bg text-white" asChild>
                <Link href="/browse">
                  Browse Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloadableProducts.map((product) => (
              <Card key={`${product.id}-${product.orderId}`} className="hover:shadow-lg transition-all">
                <CardHeader className="p-0">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                    {product.media[0] ? (
                      <img
                        src={product.media[0].url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1 mb-2">{product.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    by {product.creator.displayName || product.creator.username}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Purchased {new Date(product.orderDate).toLocaleDateString()}
                  </p>

                  {product.files && product.files.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {product.files.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                          <span className="truncate flex-1">{file.filename}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {product.files && product.files.length > 0 && (
                      <Button size="sm" className="flex-1 gradient-bg text-white" asChild>
                        <a href={`/api/products/files/${product.files[0].id}/download`}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/products/${product.slug}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
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
