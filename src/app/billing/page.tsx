import { prisma } from "@/lib/db"
import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDate } from "@/lib/helpers"
import Link from "next/link"

export default async function BillingPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const [licenses, invoices] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        payments: true,
        invoices: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        order: { buyerId: user.id },
      },
      include: {
        order: {
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Billing History</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Licenses</CardTitle>
            </CardHeader>
            <CardContent>
              {licenses.length === 0 ? (
                <p className="text-muted-foreground">No licenses yet.</p>
              ) : (
                <div className="space-y-4">
                  {licenses.slice(0, 10).map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{formatPrice(order.total)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <Badge variant={
                        order.status === "COMPLETED" ? "default" :
                        order.status === "REFUNDED" ? "destructive" : "secondary"
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-muted-foreground">No invoices yet.</p>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">#{invoice.number}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(invoice.createdAt)}
                        </p>
                      </div>
                      {invoice.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={invoice.url} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
