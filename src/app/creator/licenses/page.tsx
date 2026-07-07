import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate } from "@/lib/helpers"
import { KeyRound } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreatorLicensesPage() {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN", "OWNER"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const licenses = await prisma.license.findMany({
    where: { product: { creatorId: user.id } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      product: { select: { id: true, title: true, slug: true } },
      user: {
        select: { id: true, username: true, displayName: true, avatar: true },
      },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Licenses</h1>
          <p className="text-muted-foreground">Keys issued for your products</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/creator/products">Manage Products</Link>
        </Button>
      </div>

      {licenses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <KeyRound className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No licenses issued yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {licenses.map((license) => (
            <Card key={license.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${license.product.slug}`}
                    className="font-medium hover:underline truncate block"
                  >
                    {license.product.title}
                  </Link>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {license.licenseKey}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {license.user?.displayName || license.user?.username || "Unknown buyer"} ·{" "}
                    {formatDate(license.createdAt)}
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
    </div>
  )
}
