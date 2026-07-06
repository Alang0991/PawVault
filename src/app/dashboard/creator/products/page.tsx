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
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
} from "lucide-react"

export default async function CreatorProductsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user || !["CREATOR", "VERIFIED_CREATOR"].includes(user.role)) {
    redirect("/dashboard")
  }

  const products = await prisma.product.findMany({
    where: { creatorId: user.id },
    include: {
      _count: {
        select: {
          reviews: true,
          wishlistItems: true,
          orderItems: true
        }
      },
      media: {
        where: { isThumbnail: true },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 gradient-text">My Products</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your digital products</p>
          </div>
          <Button className="gradient-bg text-white" asChild>
            <Link href="/dashboard/creator/products/new">
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first product to start selling on PawMart
              </p>
              <Button className="gradient-bg text-white" asChild>
                <Link href="/dashboard/creator/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Product
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-all">
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
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {product.isPublished ? (
                          <Badge className="bg-green-500">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                        {product.isFeatured && (
                          <Badge className="gradient-bg text-white">Featured</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>${product.price.toFixed(2)}</span>
                    <span>{product._count.orderItems} sales</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/products/${product.slug}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/creator/products/${product.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
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
