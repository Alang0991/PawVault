import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Star } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"

export const dynamic = "force-dynamic"

export default async function FounderReviewsPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      product: { select: { title: true, slug: true } },
      user: { select: { username: true, displayName: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">{reviews.length} real reviews</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            <CardTitle>All reviews</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
          ) : (
            <div className="space-y-2">
              {reviews.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{r.product.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.rating}★ by {r.user.displayName || r.user.username}
                    </p>
                    {r.content && <p className="text-sm">{r.content}</p>}
                  </div>
                  <AdminActionButton url={`/api/admin/reviews/${r.id}`} method="DELETE" body={{}} variant="destructive" size="sm" confirm="Remove this review?">Remove</AdminActionButton>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Link href="/admin/founder" className="text-sm underline">← Back</Link>
    </div>
  )
}
