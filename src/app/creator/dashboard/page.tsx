"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  DollarSign, 
  ShoppingBag, 
  Star, 
  TrendingUp, 
  Package,
  Users,
  Plus,
  Settings,
  FileText,
  Download,
  Heart,
  MessageSquare,
  Tag
} from "lucide-react"
import { formatPrice, formatDate } from "@/lib/helpers"

export default function CreatorDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/creator/dashboard')
        if (res.ok) {
          const result = await res.json()
          setData(result)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    data ? (
      <div className="min-h-screen">
      <div className="space-y-8">
        {/* Main Content */}
        <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Creator Hub</h1>
                  <p className="text-muted-foreground">
                    {data.store?.name || 'No store created yet'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800">
                    <Link href="/creator/products/new">
                      <Plus className="mr-2 h-4 w-4" />
                      New Asset
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold">{formatPrice(data.totalRevenue)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Licenses</p>
                      <p className="text-2xl font-bold">{data.licenseCount || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-xl">
                      <Star className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                      <p className="text-2xl font-bold">{data.avgRating?.toFixed(1) || "0.0"}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assets</p>
                      <p className="text-2xl font-bold">{data.productCount || 0}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="products">Assets</TabsTrigger>
                  <TabsTrigger value="licenses">Licenses</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(data.recentOrders || []).slice(0, 5).map((order: any) => (
                            <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                              <div>
                                <p className="font-medium">
                                  {order.items[0]?.product.title || "License"}
                                  {order.items.length > 1 ? ` and ${order.items.length - 1} more` : ""}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatPrice(order.total)}</p>
                                <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                  {(!data.recentOrders || data.recentOrders.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">No orders yet.</p>
                  )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button asChild className="w-full justify-start" variant="outline">
                           <Link href="/creator/products/new">
                             <Plus className="mr-2 h-4 w-4" />
                             Create New Asset
                           </Link>
                        </Button>
                        <Button asChild className="w-full justify-start" variant="outline">
                          <Link href="/creator/media">
                            <Download className="mr-2 h-4 w-4" />
                            Upload Media
                          </Link>
                        </Button>
                        <Button asChild className="w-full justify-start" variant="outline">
                          <Link href="/creator/coupons">
                            <Tag className="mr-2 h-4 w-4" />
                            Create Coupon
                          </Link>
                        </Button>
                        <Button asChild className="w-full justify-start" variant="outline">
                          <Link href="/creator/store/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            Shop Settings
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  {data.products?.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-8 text-center">
                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">No products yet.</p>
                        <Button asChild>
                          <Link href="/creator/products/new">Create Your First Product</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {data.products.map((product: any) => (
                        <Card key={product.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6 flex items-center gap-6">
                            <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0">
                              {product.media[0] ? (
                                <img src={product.media[0].url} alt={product.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg">{product.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                 {product.category?.name || "Uncategorized"} · {product._count?.reviews || 0} reviews
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={product.isPublished ? "default" : "secondary"}>
                                  {product.isPublished ? "Published" : "Draft"}
                                </Badge>
                                {product.isOnSale && product.salePrice && (
                                  <Badge variant="destructive">On Sale</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xl font-bold">{formatPrice(product.price)}</p>
                              <div className="flex gap-2 mt-2">
                                <Button asChild size="sm" variant="outline">
                                  <Link href={`/creator/products/${product.id}/edit`}>Edit</Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="licenses" className="space-y-4">
                  {!data.recentLicenses || data.recentLicenses.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-8 text-center">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No licenses issued yet.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {data.recentLicenses.map((license: any) => (
                        <Card key={license.id} className="border-0 shadow-md">
                          <CardContent className="p-6 flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {license.product?.title || "Product"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(license.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={license.status === "ACTIVE" ? "default" : "secondary"}>
                              {license.status}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  {data.recentReviews?.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-8 text-center">
                        <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No reviews yet.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {data.recentReviews.map((review: any) => (
                        <Card key={review.id} className="border-0 shadow-md">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={review.user.avatar} alt={review.user.displayName} />
                                <AvatarFallback>{(review.user.displayName || review.user.username)[0]?.toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{review.user.displayName || review.user.username}</p>
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                          star <= review.rating ? "text-sky-500 fill-current" : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                   on <Link href={`/product/${review.product.slug}`} className="hover:underline">{review.product.title}</Link>
                                </p>
                                {review.content && <p className="text-sm">{review.content}</p>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
    ) : loading ? (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    ) : null
  )
}