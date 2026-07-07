import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatPrice, formatDate } from "@/lib/helpers"
import { Percent } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreatorDiscountsPage() {
  const user = await getServerUser()
  if (!user || !["CREATOR", "VERIFIED_CREATOR", "ADMIN"].includes(user.role)) {
    redirect("/auth/signin")
  }

  const discounts = await prisma.discount.findMany({
    where: { product: { creatorId: user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, title: true, slug: true } },
    },
  })

  const now = new Date()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Discounts</h1>
          <p className="text-muted-foreground">Time-limited price reductions on your products</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/creator/products">Manage Products</Link>
        </Button>
      </div>

      {discounts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Percent className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No discounts configured yet.</p>
            <p className="text-sm text-muted-foreground">
              Set a sale price on a product from its edit page to create a discount.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {discounts.map((d) => {
            const active = (!d.startsAt || d.startsAt <= now) && (!d.endsAt || d.endsAt >= now)
            return (
              <Card key={d.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={d.product?.slug ? `/product/${d.product.slug}` : "#"}
                      className="font-medium hover:underline truncate block"
                    >
                      {d.product?.title || "Product"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {d.type === "PERCENTAGE"
                        ? `${d.amount}% off`
                        : `${formatPrice(d.amount)} off`}
                      {d.startsAt && ` · from ${formatDate(d.startsAt)}`}
                      {d.endsAt && ` · until ${formatDate(d.endsAt)}`}
                    </p>
                  </div>
                  <Badge variant={active ? "default" : "secondary"}>
                    {active ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
