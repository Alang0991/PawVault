"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatGrid } from "@/components/creator/stat-tile"
import { CreatorDashboardSkeleton } from "@/components/creator/dashboard-skeleton"
import { EmptyState } from "@/components/empty-state"
import { SectionHeader } from "@/components/section-header"
import { Rating } from "@/components/rating"
import { formatPrice } from "@/lib/helpers"
import { formatCount } from "@/lib/format"
import { useFormattedDate } from "@/components/providers/i18n-provider"
import Image from "next/image"
import { Plus, Settings, Tag, Upload } from "lucide-react"

export default function CreatorDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { formatDate: fmtDate } = useFormattedDate()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/creator/dashboard")
        if (!res.ok) {
          setError("We couldn't load your dashboard. Please try again.")
          return
        }
        setData(await res.json())
      } catch {
        setError("We couldn't reach the server. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <CreatorDashboardSkeleton />

  if (error) {
    return (
      <div className="pv-shell py-10">
        <EmptyState
          title="Something went wrong."
          description={error}
          action={{ label: "Try again", onClick: () => window.location.reload() }}
        />
      </div>
    )
  }

  if (!data) return null

  const hasStore = Boolean(data.store)
  const drafts = data.draftProducts ?? 0

  return (
    <div className="pv-shell py-8 md:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-[32px]">
            Creator dashboard
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {hasStore ? data.store.name : "No store yet"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={hasStore ? `/store/${data.store.slug}` : "/store/create"}>
              View store
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/creator/products/new">
              <Plus className="h-4 w-4" />
              New product
            </Link>
          </Button>
        </div>
      </div>

      <StatGrid
        className="mt-8"
        stats={[
          {
            label: "Earnings",
            value: formatPrice(data.totalRevenue ?? 0),
            href: "/creator/payouts",
          },
          {
            label: "Licenses sold",
            value: formatCount(data.licenseCount ?? 0),
            href: "/creator/licenses",
          },
          {
            label: "Products",
            value: formatCount(data.productCount ?? 0),
            hint: drafts > 0 ? `${formatCount(drafts)} draft` : undefined,
            href: "/creator/products",
          },
          {
            label: "Rating",
            value: data.avgRating > 0 ? data.avgRating.toFixed(1) : "—",
            hint: data.avgRating > 0 ? `${formatCount(data.recentReviews?.length ?? 0)} recent` : "No reviews yet",
            href: "/creator/reviews",
          },
        ]}
      />

      <Tabs defaultValue="overview" className="mt-10">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
          {[
            { value: "overview", label: "Overview" },
            { value: "products", label: "Products", count: data.productCount },
            { value: "licenses", label: "Licenses", count: data.licenseCount },
            { value: "reviews", label: "Reviews" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary data-[state=active]:border-accent data-[state=active]:text-text-primary"
            >
              {tab.label}
              {typeof tab.count === "number" && tab.count > 0 && (
                <span className="ml-1.5 text-xs text-text-muted">
                  {formatCount(tab.count)}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border bg-surface p-5">
              <SectionHeader
                title="Recent orders"
                actionLabel="All orders"
                actionHref="/creator/orders"
                className="mb-4"
              />
              {(data.recentOrders ?? []).length === 0 ? (
                <EmptyState
                  title="No orders yet."
                  description="When someone buys one of your products it'll show up here."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {data.recentOrders.slice(0, 5).map((order: any) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {order.items?.[0]?.product?.title ?? "Order"}
                          {(order.items?.length ?? 0) > 1 &&
                            ` and ${order.items.length - 1} more`}
                        </p>
                        <p className="text-xs text-text-muted">
                          {fmtDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-text-primary">
                          {formatPrice(order.total)}
                        </p>
                        <StatusPill status={order.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-border bg-surface p-5">
              <SectionHeader title="Quick actions" className="mb-4" />
              <ul className="space-y-1">
                {[
                  { href: "/creator/products/new", label: "Create a product", icon: Plus },
                  { href: "/creator/media", label: "Upload media", icon: Upload },
                  { href: "/creator/coupons", label: "Create a coupon", icon: Tag },
                  { href: "/creator/store/settings", label: "Store settings", icon: Settings },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <li key={action.href}>
                      <Link
                        href={action.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-muted hover:text-text-primary focus-ring"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {action.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          {(data.products ?? []).length === 0 ? (
            <EmptyState
              title="Nothing here yet."
              description="Publish your first product and it will appear in your store and on Explore."
              action={{ label: "Create a product", href: "/creator/products/new" }}
            />
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {data.products.map((product: any) => (
                <li
                  key={product.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-subtle">
                      {product.media?.[0] ? (
                        <Image
                          src={product.media[0].url}
                          alt={product.title}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {product.title}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {product.category?.name ?? "Uncategorised"} ·{" "}
                        {formatCount(product._count?.reviews ?? 0)} reviews
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <StatusPill
                          status={product.isPublished ? "PUBLISHED" : "DRAFT"}
                          published={product.isPublished}
                        />
                        {product.isOnSale && product.salePrice && (
                          <Badge variant="sale" size="sm">
                            On sale
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                    <p className="text-sm font-semibold text-text-primary">
                      {formatPrice(product.price)}
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/creator/products/${product.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="licenses" className="mt-6">
          {(data.recentLicenses ?? []).length === 0 ? (
            <EmptyState
              title="No licenses issued yet."
              description="A license is created each time a buyer downloads one of your products."
            />
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {data.recentLicenses.map((license: any) => (
                <li
                  key={license.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {license.product?.title ?? "Product"}
                    </p>
                    <p className="text-xs text-text-muted">
                      {fmtDate(license.createdAt)}
                    </p>
                  </div>
                  <StatusPill status={license.status} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {(data.recentReviews ?? []).length === 0 ? (
            <EmptyState
              title="No reviews yet."
              description="Reviews left on your products will show up here."
            />
          ) : (
            <ul className="space-y-4">
              {data.recentReviews.map((review: any) => (
                <li key={review.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage
                        src={review.user.avatar || ""}
                        alt={review.user.displayName || review.user.username}
                      />
                      <AvatarFallback className="bg-muted text-xs text-text-secondary">
                        {(review.user.displayName || review.user.username)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">
                          {review.user.displayName || review.user.username}
                        </span>
                        <Rating rating={review.rating} size="sm" showCount={false} />
                      </div>
                      <p className="mt-0.5 text-xs text-text-muted">
                        on{" "}
                        <Link
                          href={`/product/${review.product.slug}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {review.product.title}
                        </Link>
                      </p>
                      {review.content && (
                        <p className="mt-2 text-sm text-text-secondary">{review.content}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

/** Compact status text — order state, publish state, license state. */
function StatusPill({
  status,
  published,
}: {
  status: string
  published?: boolean
}) {
  const tone =
    published ?? (status === "COMPLETED" || status === "ACTIVE" || status === "PUBLISHED")
      ? "text-success"
      : status === "DRAFT" || status === "PENDING"
        ? "text-text-muted"
        : "text-warning"

  return (
    <span className={`text-xs font-medium ${tone}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}
