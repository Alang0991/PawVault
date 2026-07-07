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
  Download,
  Heart,
  TrendingUp,
  Settings,
  Store,
} from "lucide-react"

async function getDashboardData(userId: string) {
  try {
    const recentOrders = await prisma.order.findMany({
      where: { buyerId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, title: true, slug: true, media: { where: { isThumbnail: true }, take: 1 } },
            },
          },
        },
      },
    })

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      take: 4,
      include: {
        product: {
          select: { id: true, title: true, slug: true, price: true, media: { where: { isThumbnail: true }, take: 1 } },
        },
      },
    })

    const licenses = await prisma.license.findMany({
      where: { userId },
      take: 5,
      include: {
        product: {
          select: { id: true, title: true, slug: true },
        },
      },
    })

    const products = await prisma.product.findMany({
      where: { creatorId: userId },
      take: 5,
      include: {
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return { recentOrders, wishlistItems, licenses, products }
  } catch (error) {
    console.error("Dashboard data error:", error)
    return { recentOrders: [], wishlistItems: [], licenses: [], products: [] }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  let user
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        avatar: true,
        bio: true,
        isVerified: true,
      },
    })
  } catch (error) {
    console.error("User fetch error:", error)
    user = null
  }

  if (!user) {
    redirect("/auth/signin")
  }

  const { recentOrders, wishlistItems, licenses, products } = await getDashboardData(user.id)

  const isCreator = ["CREATOR", "VERIFIED_CREATOR", "ADMIN"].includes(user.role)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 gradient-text">Welcome back, {user.displayName || user.username}</h1>
            <p className="text-gray-600 dark:text-gray-400">Here&apos;s what&apos;s happening with your account</p>
          </div>
          {isCreator && (
            <Button asChild className="gradient-bg text-white">
              <Link href="/creator/dashboard">
                <Store className="h-4 w-4 mr-2" />
                Creator Hub
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold">{recentOrders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Download className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Licenses</p>
                <p className="text-2xl font-bold">{licenses.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Wishlist</p>
                <p className="text-2xl font-bold">{wishlistItems.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <p className="font-medium">
                            {order.items[0]?.product.title || "Order"}
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

            <Card>
              <CardHeader>
                <CardTitle>My Licenses</CardTitle>
              </CardHeader>
              <CardContent>
                {licenses.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No licenses yet.</p>
                ) : (
                  <div className="space-y-4">
                    {licenses.map((license) => (
                      <div key={license.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <p className="font-medium">{license.product.title}</p>
                          <p className="text-sm text-gray-500">Key: {license.licenseKey}</p>
                        </div>
                        <Badge variant={license.status === "ACTIVE" ? "default" : "destructive"}>
                          {license.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Wishlist</CardTitle>
              </CardHeader>
              <CardContent>
                {wishlistItems.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">Your wishlist is empty.</p>
                ) : (
                  <div className="space-y-4">
                    {wishlistItems.map((item) => (
                      <Link key={item.id} href={`/products/${item.product.slug}`}>
                        <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          {item.product.media[0] && (
                            <img
                              src={item.product.media[0].url}
                              alt={item.product.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product.title}</p>
                            <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/orders">My Orders</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/downloads">Downloads</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/account/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                  </Button>
                  {isCreator && (
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/creator/dashboard">
                        <Store className="h-4 w-4 mr-2" />
                        Creator Hub
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
