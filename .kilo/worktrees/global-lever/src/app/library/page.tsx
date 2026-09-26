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
import {
  Download,
  ExternalLink,
  Package,
  Key,
  Clock,
  FileText,
  History,
  RefreshCw,
  Tag,
} from "lucide-react"

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const exp = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, exp)
  return `${value.toFixed(value >= 100 || exp === 0 ? 0 : value >= 10 ? 1 : 2)} ${units[exp]}`
}

function getLatestVersion(versions: any[]): string | null {
  if (!versions || versions.length === 0) return null
  const current = versions.find((v) => v.isCurrent)
  if (current) return current.version
  return versions[versions.length - 1].version
}

function getLastDownloadedVersion(downloads: any[]): string | null {
  if (!downloads || downloads.length === 0) return null
  const latest = downloads[downloads.length - 1]
  return latest.file?.version || latest.productVersion || null
}

function versionIsNewer(current: string | null, downloaded: string | null): boolean {
  if (!current) return false
  if (!downloaded) return true
  if (current === downloaded) return false

  const parse = (v: string) =>
    v
      .split(".")
      .map((part) => parseInt(part.replace(/\D/g, "") || "0", 10))
      .filter((n) => !isNaN(n))

  const a = parse(current)
  const b = parse(downloaded)
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0
    const bv = b[i] ?? 0
    if (av > bv) return true
    if (av < bv) return false
  }
  return false
}

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
          files: { orderBy: [{ folder: "asc" }, { createdAt: "asc" }] },
          versions: { orderBy: { createdAt: "desc" } },
        },
      },
      order: { select: { id: true, createdAt: true, total: true, currency: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const downloads = await prisma.download.findMany({
    where: { userId: user.id },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          title: true,
          version: true,
          media: { where: { isThumbnail: true }, take: 1 },
        },
      },
      file: {
        select: {
          id: true,
          filename: true,
          size: true,
          version: true,
        },
      },
    },
    orderBy: { downloadedAt: "desc" },
    take: 12,
  })

  const enrichedLicenses = licenses.map((license) => {
    const product = license.product
    const productDownloads = downloads.filter((d) => d.productId === product.id)
    const lastDownloadedVersion = getLastDownloadedVersion(productDownloads)
    const currentVersion = product.version || getLatestVersion(product.versions)
    const hasUpdate = versionIsNewer(currentVersion, lastDownloadedVersion)

    return {
      ...license,
      product: {
        ...product,
        currentVersion,
        lastDownloadedVersion,
        hasUpdate,
      },
    }
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
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrichedLicenses.map((license) => (
                <LibraryCard key={license.id} license={license} />
              ))}
            </div>

            {downloads.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-text-muted" />
                  <h2 className="text-xl font-semibold text-text-primary">Recent downloads</h2>
                </div>
                <Card>
                  <CardContent className="p-0 divide-y divide-border">
                    {downloads.map((download) => (
                      <div
                        key={download.id}
                        className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-surface-subtle shrink-0">
                          {download.product.media?.[0] ? (
                            <img
                              src={download.product.media[0].url}
                              alt={download.product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-text-muted">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${download.product.slug}`}
                            className="font-medium text-sm text-text-primary hover:text-accent line-clamp-1 block"
                          >
                            {download.product.title}
                          </Link>
                          <p className="text-xs text-text-muted truncate">
                            {download.file?.filename || "Product files"}
                            {download.file?.version && ` · v${download.file.version}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <a
                            href={`/api/products/files/${download.file?.id || ""}/download`}
                            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            Re-download
                          </a>
                          <p className="text-xs text-text-muted mt-1">
                            {formatDate(download.downloadedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function LibraryCard({ license }: { license: any }) {
  const product = license.product
  const thumbnail = product.media[0]
  const creatorName = product.creator.displayName || product.creator.username
  const hasFiles = product.files && product.files.length > 0

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-surface-subtle relative">
          {thumbnail ? (
            <AdultContentPreview
              mediaId={thumbnail.id}
              directUrl={thumbnail.url}
              contentRating={product.contentRating || "SFW"}
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
          {product.hasUpdate && (
            <Badge variant="warning" className="absolute top-2 right-2">
              <RefreshCw className="h-3 w-3 mr-1" />
              Update available
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col">
        <CardTitle className="text-base text-text-primary line-clamp-1">
          {product.title}
        </CardTitle>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {product.currentVersion && (
            <Badge variant="subtle" size="sm">
              v{product.currentVersion}
            </Badge>
          )}
          {product.lastDownloadedVersion && (
            <span className="text-[10px] text-text-muted">
              downloaded v{product.lastDownloadedVersion}
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted mt-1">
          by {creatorName}
        </p>

        {license.licenseKey && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <Key className="h-3.5 w-3.5 text-text-muted" />
            <span className="font-mono text-text-secondary break-all">
              {license.licenseKey}
            </span>
            <a
              href={`/api/licenses/${license.id}/download`}
              className="ml-auto text-accent hover:underline flex items-center gap-1 shrink-0"
              aria-label="Download license file"
            >
              <Download className="h-3 w-3" />
              License file
            </a>
          </div>
        )}

        <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Purchased {formatDate(license.order.createdAt)}
          </span>
        </div>

        {product.versions && product.versions.length > 1 && (
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer text-text-secondary hover:text-accent flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Version history ({product.versions.length})
            </summary>
            <div className="mt-2 space-y-2 pl-1">
              {product.versions.map((v: any) => (
                <div key={v.id} className="border-l-2 border-border pl-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-text-primary">v{v.version}</span>
                    {v.isCurrent && (
                      <Badge variant="success" size="sm">Current</Badge>
                    )}
                    {v.isPrerelease && (
                      <Badge variant="outline" size="sm">Pre-release</Badge>
                    )}
                  </div>
                  {v.releaseNotes && (
                    <p className="text-text-muted mt-0.5 line-clamp-2">
                      {v.releaseNotes}
                    </p>
                  )}
                  <p className="text-text-muted mt-0.5">
                    {formatDate(v.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}

        {hasFiles && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[11px] uppercase tracking-wider text-text-muted flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Files ({product.files.length})
            </p>
            {product.files.map((file: any) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-2 text-xs border rounded-md px-2 py-1.5 bg-surface-subtle/50"
              >
                <span className="text-text-secondary truncate flex-1 min-w-0">
                  {file.filename}
                  {file.version && <span className="text-text-muted"> · v{file.version}</span>}
                  {file.platform && <span className="text-text-muted"> · {file.platform}</span>}
                </span>
                <span className="text-text-muted shrink-0 text-right">
                  {formatBytes(file.size)}
                  {file.lastDownloadedAt && (
                    <span className="block text-[10px] text-text-muted">
                      Downloaded {formatDate(file.lastDownloadedAt)}
                    </span>
                  )}
                </span>
                <a
                  href={`/api/products/files/${file.id}/download`}
                  className="text-accent hover:underline shrink-0 flex items-center gap-1"
                  aria-label={`Download ${file.filename}`}
                >
                  <Download className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        {hasFiles ? (
          <Button size="sm" className="flex-1" asChild>
            <a href={`/api/products/files/${product.files[0].id}/download`}>
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
}
