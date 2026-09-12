import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Award, Trash2, User } from "lucide-react"
import Link from "next/link"
import { BadgeRow } from "@/components/badge-row"

export const dynamic = "force-dynamic"

export default async function FounderBadgesPage() {
  const user = await getServerUser()
  if (!user || user.role !== "FOUNDER") {
    redirect("/admin")
  }

  let badges: any[] = []
  try {
    badges = await prisma.creatorBadge.findMany({
      include: { user: { select: { username: true, displayName: true, role: true } } },
      orderBy: { earnedAt: "desc" },
      take: 100,
    })
  } catch (error) {
    console.error("Failed to fetch badges:", error)
  }

  const badgeTypes = Array.from(new Set(badges.map((b) => b.badgeType)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Creator badges</h1>
          <p className="text-sm text-muted-foreground">Award achievement badges to creators.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/founder">← Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Award badge</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/badges" method="POST" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>User ID</Label>
                <Input name="userId" required placeholder="User ID to award badge to" />
              </div>
              <div className="space-y-1">
                <Label>Badge type</Label>
                <select name="badgeType" className="w-full border rounded-md px-3 py-2 bg-background text-sm" required>
                  <option value="">Select type...</option>
                  <option value="verified">Verified Creator</option>
                  <option value="top_seller">Top Seller</option>
                  <option value="early_adopter">Early Adopter</option>
                  <option value="trending">Trending Creator</option>
                  <option value="premium">Premium</option>
                  <option value="staff_pick">Staff Pick</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Badge name</Label>
                <Input name="name" required placeholder="e.g. Verified Creator" />
              </div>
              <div className="space-y-1">
                <Label>Icon URL (optional)</Label>
                <Input name="iconUrl" placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description (optional)</Label>
              <Input name="description" placeholder="Short description" />
            </div>
            <Button type="submit" size="sm">
              <Award className="h-3 w-3 mr-1" /> Award badge
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">All badges</CardTitle>
              <CardDescription>{badges.length} badges awarded</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No badges awarded yet.</p>
          ) : (
            <div className="space-y-3">
              {badges.map((b) => (
                <BadgeRow key={b.id} badge={b} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}