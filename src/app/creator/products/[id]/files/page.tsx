import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FilesContentManager, type ProductFileDTO } from "./files-content-manager"

export const dynamic = "force-dynamic"

export default async function ProductFilesPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN", "FOUNDER"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
      creatorId: true,
      files: {
        orderBy: [{ folder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          filename: true,
          url: true,
          size: true,
          folder: true,
          version: true,
          platform: true,
          createdAt: true,
        },
      },
    },
  })

  if (!product) notFound()
  if (product.creatorId !== user.id && user.role !== "ADMIN") notFound()

  const initialFiles: ProductFileDTO[] = product.files.map((f) => ({
    id: f.id,
    filename: f.filename,
    url: f.url,
    size: f.size,
    folder: f.folder || "",
    version: f.version ?? null,
    platform: f.platform ?? null,
    createdAt: f.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/creator/products/${product.id}/edit`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">Files &amp; Content</h1>
              <Badge variant={product.isPublished ? "default" : "secondary"}>
                {product.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {product.title || "Untitled product"} · Manage the files customers will receive.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/creator/products/${product.id}/edit`}>Back to editor</Link>
        </Button>
      </div>

      <FilesContentManager
        productId={product.id}
        isPublished={product.isPublished}
        initialFiles={initialFiles}
      />
    </div>
  )
}
