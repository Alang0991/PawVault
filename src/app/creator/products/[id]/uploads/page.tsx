import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Upload, Trash2 } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface UploadsPageProps {
  params: { id: string }
}

export default async function ProductUploadsPage({ params }: UploadsPageProps) {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN"].includes(user.role)) {
    redirect("/auth/signin")
  }

  let product
  try {
    product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        media: { orderBy: { order: "asc" } },
        files: { orderBy: { createdAt: "asc" } },
      },
    })
  } catch (error) {
    console.error("Uploads page data error:", error)
    redirect("/creator/products")
  }

  if (!product || (product.creatorId !== user.id && user.role !== "ADMIN")) {
    redirect("/creator/products")
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/creator/products/${product.id}/edit`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manage Uploads</h1>
            <p className="text-muted-foreground">
              {product.title} · <Badge variant={product.isPublished ? "default" : "secondary"}>{product.isPublished ? "Published" : "Draft"}</Badge>
            </p>
          </div>
        </div>

        <Tabs defaultValue="media" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="media">Media ({product.media.length})</TabsTrigger>
            <TabsTrigger value="files">Files ({product.files.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Gallery Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.media.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No media uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {product.media.map((m) => (
                      <div key={m.id} className={`relative rounded-lg overflow-hidden border-2 ${m.isThumbnail ? "border-purple-500" : "border-transparent"}`}>
                        <div className="aspect-square bg-muted">
                          {m.type === "video" ? (
                            <video src={m.url} className="w-full h-full object-cover" controls />
                          ) : (
                            <img src={m.url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="absolute top-1 right-1 flex gap-1">
                          {m.isThumbnail && (
                            <span className="text-[10px] bg-purple-600 text-white rounded px-1">Thumb</span>
                          )}
                        </div>
                        <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center">
                          <span className="text-[10px] bg-black/60 text-white rounded px-1">#{m.order}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Downloadable Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.files.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No files uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {product.files.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 border rounded-md p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{f.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {(f.size / 1024 / 1024).toFixed(1)} MB
                            {f.version ? ` · v${f.version}` : ""}
                            {f.platform ? ` · ${f.platform}` : ""}
                          </p>
                        </div>
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
