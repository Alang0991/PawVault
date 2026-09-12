import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Plus, Eye, Pencil } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreatorBundlesPage() {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN", "FOUNDER"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const bundles = await prisma.bundle.findMany({
    where: { creatorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
      items: {
        take: 4,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              media: { where: { isThumbnail: true }, take: 1 },
            },
          },
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My bundles</h1>
          <p className="text-sm text-muted-foreground">
            Bundle your products together and offer them at a discounted price.
          </p>
        </div>
        <Button asChild className="gradient-bg text-white">
          <Link href="/creator/bundles/new">
            <Plus className="mr-2 h-4 w-4" /> New bundle
          </Link>
        </Button>
      </div>

      {bundles.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No bundles yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a bundle to sell multiple products together at a discount.
            </p>
            <Button asChild>
              <Link href="/creator/bundles/new">
                <Plus className="mr-2 h-4 w-4" /> Create your first bundle
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {bundles.map((bundle) => (
            <BundleRow key={bundle.id} bundle={bundle} />
          ))}
        </div>
      )}
    </div>
  )
}

function BundleRow({ bundle }: { bundle: any }) {
  return (
    <Card className="hover:bg-muted/30 transition-colors">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center">
            {bundle.items?.[0]?.product?.media?.[0] ? (
              <img
                src={bundle.items[0].product.media[0].url}
                alt={bundle.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold truncate">{bundle.name}</p>
              <Badge variant={bundle.isPublished ? "default" : "secondary"}>
                {bundle.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{bundle._count.items} product{bundle._count.items === 1 ? "" : "s"}</span>
              <span>${bundle.price.toFixed(2)}</span>
              <span>Created {formatRelative(new Date(bundle.createdAt))}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {bundle.isPublished && (
            <Button asChild size="sm" variant="ghost">
              <Link href={`/bundles/${bundle.slug}`} target="_blank">
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Link>
            </Button>
          )}
          <Button asChild size="sm" variant="outline">
            <Link href={`/creator/bundles/${bundle.id}`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function formatRelative(d: Date) {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
