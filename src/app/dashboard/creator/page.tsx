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
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Plus,
} from "lucide-react"

async function getCreatorDashboardData(userId: string) {
  const [products, orders, totalRevenue, totalSales, followers] = await Promise.all([
    prisma.product.findMany({
      where: { creatorId: userId },
      include: {
        _count: {
          select: {
            reviews: true,
            wishlistItems: true,
            orderItems: true
          }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              creatorId: userId
            }
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.orderItem.aggregate({
      _sum: {
        price: true
      },
      where: {
        product: {
          creatorId: userId
        }
      }
    }),
    prisma.orderItem.count({
      where: {
        product: {
          creatorId: userId
        }
      }
    }),
    prisma.user.count({
      where: {
        following: {
          some: {
            followingId: userId
          }
        }
      }
    })
  ])

  const avgRating = products.length > 0
    ? products.reduce((sum, p) => {
        const productAvg = p.reviews.length > 0
          ? p.reviews.reduce((rSum, r) => rSum + r.rating, 0) / p.reviews.length
          : 0
        return sum + productAvg
      }, 0) / products.length
    : 0

  return {
    products,
    orders,
    totalRevenue: totalRevenue._sum.price || 0,
    totalSales,
    followers,
    avgRating
  }
}

export default async function CreatorDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user || !["CREATOR", "VERIFIED_CREATOR"].includes(user.role)) {
    redirect("/dashboard")
  }

  const { products, orders, totalRevenue, totalSales, followers, avgRating } = await getCreatorDashboardData(user.id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 gradient-text">Creator Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your products and track your performance</p>
          </div>
          <Button className="gradient-bg text-white" asChild>
            <Link href="/dashboard/creator/products/new">
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold">{totalSales}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
                <p className="text-2xl font-bold">{followers}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Products */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Products</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/creator/products">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No products yet</p>
                    <Button className="gradient-bg text-white" asChild>
                      <Link href="/dashboard/creator/products/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Product
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{product.title}</h3>
                            {product.isPublished ? (
                              <Badge className="bg-green-500">Published</Badge>
                            ) : (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>${product.price.toFixed(2)}</span>
                            <span>{product._count.orderItems} sales</span>
                            <span>{product._count.reviews} reviews</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/creator/products/${product.id}`}>Edit</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <p className="font-medium">
                            {order.items[0]?.product.title}
                            {order.items.length > 1 ? ` and ${order.items.length - 1} more` : ""}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
                  <span className="font-bold">{avgRating.toFixed(1)} / 5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</span>
                  <span className="font-bold">{products.reduce((sum, p) => sum + p._count.reviews, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Wishlist Items</span>
                  <span className="font-bold">{products.reduce((sum, p) => sum + p._count.wishlistItems, 0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/dashboard/creator/products">Manage Products</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/dashboard/creator/analytics">Analytics</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/dashboard/creator/payouts">Payouts</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/dashboard/creator/settings">Store Settings</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
