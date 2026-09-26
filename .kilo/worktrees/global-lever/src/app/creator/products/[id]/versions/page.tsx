import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Tag, Calendar, Trash2, Plus, Copy, History } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"

export const dynamic = "force-dynamic"

export default async function ProductVersionsPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      slug: true,
      version: true,
      creatorId: true,
    },
  })

  if (!product) {
    redirect("/creator/products")
  }

  if (product.creatorId !== user.id && !["ADMIN", "FOUNDER"].includes(user.role)) {
    redirect("/creator/products")
  }

  let versions: any[] = []
  try {
    versions = await prisma.productVersion.findMany({
      where: { productId: params.id },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Failed to fetch versions:", error)
  }

  const serializedVersions = versions.map((v) => ({
    id: v.id,
    productId: v.productId,
    version: v.version,
    changelog: v.changelog,
    releaseNotes: v.releaseNotes,
    isCurrent: v.isCurrent ?? false,
    isPrerelease: v.isPrerelease ?? false,
    files: v.files,
    createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : new Date(v.createdAt).toISOString(),
    updatedAt: v.updatedAt instanceof Date ? v.updatedAt.toISOString() : new Date(v.updatedAt).toISOString(),
  }))

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Version History</h1>
            <p className="text-text-secondary">Product: {product.title}</p>
          </div>
          <Link href="/creator/products">
            <Button variant="outline">
              <Tag className="h-4 w-4 mr-2" />
              All Products
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <CardTitle className="text-base">Create New Version</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form action={`/api/creator/products/${params.id}/versions`} method="POST" className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="version">Version number</Label>
                <Input id="version" name="version" placeholder="e.g. 1.2.0" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="changelog">Changelog</Label>
                <Textarea
                  id="changelog"
                  name="changelog"
                  placeholder="What changed in this version?"
                  rows={3}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="releaseNotes">Release notes (optional, public)</Label>
                <Textarea
                  id="releaseNotes"
                  name="releaseNotes"
                  placeholder="Detailed notes for users..."
                  rows={4}
                />
              </div>
              <Button type="submit" className="gradient-bg text-white">
                Create Version
              </Button>
            </form>
          </CardContent>
        </Card>

        {serializedVersions.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No versions created yet.</p>
              <p className="text-xs text-muted-foreground">
                Versions track updates to your product. The current product version is{" "}
                <strong>{product.version || "unversioned"}</strong>.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {serializedVersions.map((v) => (
              <Card key={v.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{v.version}</h3>
                        {v.isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {v.isPrerelease && (
                          <Badge variant="secondary" className="text-xs">
                            Pre-release
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(v.createdAt).toLocaleDateString()}
                        </span>
                        {v.updatedAt !== v.createdAt && (
                          <span>Updated {new Date(v.updatedAt).toLocaleDateString()}</span>
                        )}
                        {product.version === v.version && (
                          <Badge variant="outline" className="text-xs">
                            Live
                          </Badge>
                        )}
                      </div>
                      {v.changelog && (
                        <p className="text-sm text-text-secondary whitespace-pre-wrap mb-1">
                          {v.changelog}
                        </p>
                      )}
                      {v.releaseNotes && (
                        <p className="text-sm text-text-secondary whitespace-pre-wrap mb-1">
                          {v.releaseNotes}
                        </p>
                      )}
                      {v.files && (
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(v.files!)}
                          className="text-xs text-muted-foreground hover:text-foreground underline flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copy file list
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <AdminActionButton
                        url={`/api/creator/products/${params.id}/versions`}
                        method="DELETE"
                        body={{ versionId: v.id }}
                        variant="ghost"
                        size="sm"
                        confirm="Delete this version? This cannot be undone."
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </AdminActionButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 pt-4 border-t">
          <Link href={`/creator/products/${params.id}/uploads`} className="text-sm underline">
            ← Back to product
          </Link>
        </div>
      </div>
    </div>
  )
}
