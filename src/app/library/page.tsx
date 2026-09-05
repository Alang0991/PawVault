export const dynamic = 'force-dynamic'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  Download,
  ExternalLink,
  Package,
} from "lucide-react"

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const licenses = await prisma.license.findMany({
    where: {
      userId: session.user.id,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      createdAt: true,
      product: {
        include: {
          media: { where: { isThumbnail: true }, take: 1 },
          creator: { select: { id: true, username: true, displayName: true } },
          files: true,
        },
      },
      order: { select: { id: true, createdAt: true, total: true, currency: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">My Library</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Products you own and can download</p>

        {licenses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Purchase products to add them to your library
              </p>
              <Button className="gradient-bg text-white" asChild>
                <Link href="/browse">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenses.map((license) => (
              <Card key={license.id} className="hover:shadow-lg transition-all">
                <CardHeader className="p-0">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                    {license.product.media[0] ? (
                      <img
                        src={license.product.media[0].url}
                        alt={license.product.title}
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
                    <h3 className="font-semibold line-clamp-1">{license.product.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    by {license.product.creator.displayName || license.product.creator.username}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>Purchased {new Date(license.order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    {license.product.files && license.product.files.length > 0 && (
                      <Button size="sm" className="flex-1 gradient-bg text-white" asChild>
                        <a href={`/api/products/files/${license.product.files[0].id}/download`}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/products/${license.product.slug}`}>
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