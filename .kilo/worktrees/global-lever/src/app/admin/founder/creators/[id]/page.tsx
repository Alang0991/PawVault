import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, TrendingUp, Package, ShoppingCart, Download, Shield, AlertCircle } from "lucide-react"
import { AdminActionButton } from "@/components/admin-action-button"

export const dynamic = "force-dynamic"

export default async function CreatorDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getServerUser()
  if (!user || !["FOUNDER", "ADMIN", "MODERATOR"].includes(user.role)) {
    redirect("/admin")
  }

  const creator = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, username: true, displayName: true, email: true, role: true,
      status: true, isVerified: true, isFeatured: true, createdAt: true,
      bannedReason: true, suspendedReason: true, suspendedUntil: true,
      creatorStatus: true, creatorTermsAcceptedAt: true, bio: true, avatar: true,
    },
  })

  if (!creator) {
    redirect("/admin/founder/creators")
  }

  const [stats, store, products, orders, downloads] = await Promise.all([
    prisma.product.count({ where: { creatorId: params.id } }),
    prisma.store.findFirst({ where: { userId: params.id }, select: { id: true, name: true, slug: true, visibility: true, description: true } }),
    prisma.product.findMany({ where: { creatorId: params.id }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, title: true, isPublished: true, price: true, status: true } }),
    prisma.order.count({ where: { creatorId: params.id } }),
    prisma.download.count({ where: { productId: { in: (await prisma.product.findMany({ where: { creatorId: params.id }, select: { id: true } })).map(p => p.id) } } }),
  ])

  const restrictionInfo: Array<{ icon: any; label: string; value: string; variant: "default" | "secondary" | "destructive" | "outline" }> = []

  if (creator.status === "SUSPENDED") {
    restrictionInfo.push({ icon: AlertCircle, label: "Suspended until", value: creator.suspendedUntil?.toISOString() || "Unknown", variant: "destructive" })
    if (creator.suspendedReason) restrictionInfo.push({ icon: AlertCircle, label: "Reason", value: creator.suspendedReason, variant: "destructive" })
  }
  if (creator.status === "BANNED") {
    restrictionInfo.push({ icon: Shield, label: "Banned", value: creator.bannedReason || "No reason given", variant: "destructive" })
  }
  if (creator.creatorStatus === "SUSPENDED") {
    restrictionInfo.push({ icon: Shield, label: "Creator Suspended", value: "Active suspension", variant: "destructive" })
  }
  if (creator.creatorStatus === "BANNED") {
    restrictionInfo.push({ icon: Shield, label: "Creator Banned", value: "Permanent ban", variant: "destructive" })
  }
  if (creator.creatorStatus === "REJECTED") {
    restrictionInfo.push({ icon: AlertCircle, label: "Application Rejected", value: "See applications", variant: "outline" })
  }
  if (creator.creatorStatus === "NONE" || creator.creatorStatus === "APPLICATION_DRAFT" || creator.creatorStatus === "APPLICATION_SUBMITTED") {
    restrictionInfo.push({ icon: AlertCircle, label: "Creator Status", value: creator.creatorStatus, variant: "outline" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{creator.displayName || creator.username}</h1>
        <p className="text-sm text-muted-foreground">@{creator.username} · {creator.role}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Package} label="Products" value={stats} />
        <StatCard icon={ShoppingCart} label="Orders" value={orders} />
        <StatCard icon={Download} label="Downloads" value={downloads} />
        <StatCard icon={TrendingUp} label="Total Revenue" value={0} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <CardTitle className="text-base">Store Preview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {store ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{store.name}</p>
                <Badge variant={store.visibility === "PUBLISHED" ? "default" : store.visibility === "SUSPENDED" ? "destructive" : "secondary"} className="text-xs">
                  {store.visibility}
                </Badge>
              </div>
              {store.description && <p className="text-sm text-muted-foreground">{store.description}</p>}
              <p className="text-xs text-muted-foreground">/stores/{store.slug}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No store set up.</p>
          )}
        </CardContent>
      </Card>

      {restrictionInfo.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-rose-500" />
              <CardTitle className="text-base">Restrictions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {restrictionInfo.map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <r.icon className="h-4 w-4 text-rose-500" />
                <div>
                  <p className="text-xs font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status & Badges</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant={creator.status === "ACTIVE" ? "default" : "destructive"}>{creator.status}</Badge>
          <Badge variant={creator.role === "VERIFIED_CREATOR" ? "default" : "secondary"}>{creator.role}</Badge>
          <Badge variant={creator.creatorStatus === "APPROVED" ? "default" : "secondary"}>Creator: {creator.creatorStatus}</Badge>
          {creator.isVerified && <Badge variant="outline">Verified</Badge>}
          {creator.isFeatured && <Badge variant="outline">Featured</Badge>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products.</p>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <Link href={`/admin/founder/products/${p.id}`} className="text-sm font-medium hover:underline">{p.title}</Link>
                  <div className="flex gap-1">
                    <Badge variant={p.isPublished ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                    <span className="text-xs text-muted-foreground">${p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <AdminActionButton url={`/api/admin/creators/${creator.id}/action`} method="POST" body={{ action: "suspend", reason: "Admin suspension" }} variant="secondary" size="sm">Suspend</AdminActionButton>
        <AdminActionButton url={`/api/admin/creators/${creator.id}/action`} method="POST" body={{ action: "ban", reason: "Admin ban" }} variant="destructive" size="sm">Ban</AdminActionButton>
        <AdminActionButton url={`/api/admin/creators/${creator.id}/action`} method="POST" body={{ action: "unsuspend" }} variant="secondary" size="sm">Unsuspend</AdminActionButton>
        <AdminActionButton url={`/api/admin/creators/${creator.id}/action`} method="POST" body={{ action: "unban" }} variant="secondary" size="sm">Unban</AdminActionButton>
      </div>

      <Link href="/admin/founder/creators" className="text-sm underline">← Back</Link>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-lg font-bold">{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
