import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Package, Shield, AlertTriangle, CheckCircle, XCircle, Edit2, Archive, RotateCcw } from "lucide-react"
import { ModerationProductRow } from "./moderation-product-row"

export const dynamic = "force-dynamic"

export default async function ModerationProductsPage() {
  const user = await getServerUser()
  if (!user || !["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)) {
    redirect("/moderation")
  }

  let products: any[] = []
  try {
    products = await prisma.product.findMany({
      where: {
        status: {
          in: ["PENDING_REVIEW", "CHANGES_REQUESTED", "APPROVED", "SUSPENDED", "REJECTED"] as any[],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, email: true },
        },
        category: true,
        media: {
          where: { isThumbnail: true },
          take: 1,
        },
        _count: { select: { reviews: true, favorites: true } },
      },
    })
  } catch (error) {
    console.error("Moderation products error:", error)
    products = []
  }

  // Fetch moderation history separately since ProductModeration has no relation to User
  const productIds = products.map((p) => p.id)
  const moderationRecords = await prisma.productModeration.findMany({
    where: { productId: { in: productIds } },
    orderBy: { createdAt: "desc" },
  })

  // Fetch actor details separately
  const actorIds = moderationRecords.map((m) => m.actorId).filter(Boolean)
  const actors = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, username: true, displayName: true },
  })
  const actorMap = new Map(actors.map((a) => [a.id, a]))

  // Group moderation history by product ID
  const historyByProduct: Record<string, any[]> = {}
  for (const entry of moderationRecords) {
    const enriched = {
      ...entry,
      actor: actorMap.get(entry.actorId) || { username: "Unknown", displayName: null },
    }
    if (!historyByProduct[entry.productId]) {
      historyByProduct[entry.productId] = []
    }
    historyByProduct[entry.productId].push(enriched)
  }

  // Attach moderation history to products
  for (const product of products) {
    product.productModeration = historyByProduct[product.id] || []
  }

  const statusCounts = {
    pending: products.filter((p) => p.status === "PENDING_REVIEW").length,
    changesRequested: products.filter((p) => p.status === "CHANGES_REQUESTED").length,
    approved: products.filter((p) => p.status === "APPROVED").length,
    suspended: products.filter((p) => p.status === "SUSPENDED").length,
    rejected: products.filter((p) => p.status === "REJECTED").length,
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Product Moderation</h1>
          <p className="text-muted-foreground">Review, approve, reject, and moderate product listings</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold mt-1">{statusCounts.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Changes Req</span>
              </div>
              <p className="text-2xl font-bold mt-1">{statusCounts.changesRequested}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Approved</span>
              </div>
              <p className="text-2xl font-bold mt-1">{statusCounts.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Suspended</span>
              </div>
              <p className="text-2xl font-bold mt-1">{statusCounts.suspended}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Rejected</span>
              </div>
              <p className="text-2xl font-bold mt-1">{statusCounts.rejected}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No products awaiting moderation.</p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <ModerationProductRow key={product.id} product={product} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Link href="/moderation" className="text-sm underline">← Back to Moderation</Link>
        </div>
      </div>
    </div>
  )
}