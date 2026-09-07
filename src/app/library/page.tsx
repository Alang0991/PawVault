export const dynamic = "force-dynamic"

import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { formatDate } from "@/lib/helpers"
import { Download, ExternalLink, Package, Key, Clock } from "lucide-react"

export default async function LibraryPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const licenses = await prisma.license.findMany({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
    select: {
      id: true,
      licenseKey: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          slug: true,
          title: true,
          version: true,
          contentRating: true,
          media: { where: { isThumbnail: true }, take: 1 },
          creator: { select: { id: true, username: true, displayName: true, avatar: true } },
          files: true,
        },
      },
      order: { select: { id: true, createdAt: true, total: true, currency: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">My Library</h1>
          <p className="text-sm text-text-secondary mt-1">
            {licenses.length === 0
              ? "Products you purchase appear here."
              : `${licenses.length} product${licenses.length === 1 ? "" : "s"} in your collection`}
          </p>
        </div>

        {licenses.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
              <Package className="h-7 w-7 text-text-muted" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              No products yet
            </h2>
            <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
              Purchase products to add them to your library. Your downloads and
              license keys will appear here.
            </p>
            <Button asChild>
              <Link href="/browse">Browse Marketplace</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenses.map((license) => {
              const product = license.product
              const thumbnail = product.media[0]
              const creatorName =
                product.creator.displayName || product.creator.username
              const hasFiles = product.files && product.files.length > 0
              const latestVersion = product.files.reduce((latest, f) => {
                if (!f.version) return latest
                if (!latest || f.version > latest) return f.version
                return latest
              }, product.version || null)

              return (
                <Card key={license.id} className="flex flex-col h-full">
                  <CardHeader className="p-0">
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-surface-subtle">
                      {thumbnail ? (
                        <AdultContentPreview
                          mediaId={thumbnail.id}
                          directUrl={thumbnail.url}
                          contentRating="SFW"
                          alt={product.title}
                          variant="image"
                          className="aspect-video w-full"
                          imgClassName="aspect-video w-full object-cover"
                          showBadge={false}
                        />
                      ) : (
                        <div className="aspect-video w-full flex items-center justify-center text-text-muted">
                          <Package className="h-8 w-8 opacity-30" />
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 flex-1 flex flex-col">
                    <CardTitle className="text-base text-text-primary line-clamp-1">
                      {product.title}
                    </CardTitle>
                    {product.version && (
                      <Badge variant="subtle" size="sm" className="mt-1 w-fit">
                        v{product.version}
                      </Badge>
                    )}
                    <p className="text-xs text-text-muted mt-1">
                      by {creatorName}
                    </p>

                    {license.licenseKey && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs">
                        <Key className="h-3.5 w-3.5 text-text-muted" />
                        <span className="font-mono text-text-secondary break-all">
                          {license.licenseKey}
                        </span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Purchased {formatDate(license.order.createdAt)}
                      </span>
                    </div>

                    {latestVersion && (
                      <p className="mt-1 text-xs text-text-muted">
                        Version {latestVersion}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="pt-0 gap-2">
                    {hasFiles ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href={`/api/products/files/${product.files[0].id}/download`}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={`/product/${product.slug}`}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Link>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/product/${product.slug}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
