export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AddBundleToCart } from "@/components/add-bundle-to-cart"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Package,
  TrendingDown,
  Download,
  ShieldCheck,
  ExternalLink,
} from "lucide-react"

async function getBundle(slug: string) {
  const bundle = await prisma.bundle.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          isVerified: true,
          isInternal: true,
        },
      },
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          visibility: true,
        },
      },
      items: {
        orderBy: { order: "asc" },
        include: {
          product: {
            include: {
              media: { where: { isThumbnail: true }, take: 1 },
              creator: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  isVerified: true,
                },
              },
              reviews: { select: { rating: true } },
              _count: { select: { reviews: true, favorites: true } },
            },
          },
        },
      },
    },
  })

  if (!bundle) notFound()

  const user = await getServerUser()
  const isOwner =
    user &&
    (bundle.creatorId === user.id || ["ADMIN", "FOUNDER"].includes(user.role))

  if (!bundle.isPublished && !isOwner) notFound()
  if (bundle.creator.isInternal && !isOwner) notFound()
  if (bundle.store?.visibility !== "PUBLISHED" && !isOwner) notFound()

  return bundle
}

function enrichBundle(bundle: any) {
  const totalValue = bundle.items.reduce(
    (sum: number, item: any) => {
      const p = item.product
      const effectivePrice = p.isOnSale && p.salePrice != null ? p.salePrice : p.price
      return sum + effectivePrice
    },
    0
  )
  const savings = Math.max(0, totalValue - bundle.price)
  return {
    ...bundle,
    totalValue,
    savings,
    savingsPercent: totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0,
    itemCount: bundle.items.length,
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const bundle = enrichBundle(await getBundle(params.slug))
  return {
    title: `${bundle.name} | PawVault Bundles`,
    description: bundle.description || `Buy the ${bundle.name} bundle on PawVault`,
  }
}

export default async function BundlePage({ params }: { params: { slug: string } }) {
  const bundle = enrichBundle(await getBundle(params.slug))
  const currentUser = await getServerUser()

  const creatorName = bundle.creator.displayName || bundle.creator.username
  const firstProduct = bundle.items[0]?.product
  const coverImage = bundle.coverImage || firstProduct?.media?.[0]?.url

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <Link
            href="/bundles"
            className="text-sm text-text-secondary hover:text-accent flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3 rotate-180" /> Back to bundles
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-10">
          <div>
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-surface-subtle relative">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={bundle.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <Package className="h-16 w-16 opacity-40" />
                </div>
              )}
              {bundle.savings > 0 && (
                <Badge variant="success" className="absolute top-3 left-3">
                  Save {bundle.savingsPercent}%
                </Badge>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Bundle value</span>
                <span className="font-medium text-text-primary">
                  ${bundle.totalValue.toFixed(2)}
                </span>
              </div>
              {bundle.savings > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <TrendingDown className="h-4 w-4 text-emerald-600" /> You save
                  </span>
                  <span className="font-semibold text-emerald-600">
                    ${bundle.savings.toFixed(2)} ({bundle.savingsPercent}%)
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-text-primary">Bundle price</span>
                <span className="text-3xl font-bold text-text-primary">
                  ${bundle.price.toFixed(2)}
                </span>
              </div>
              <AddBundleToCart bundleId={bundle.id} />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold text-text-primary">{bundle.name}</h1>
                <Badge variant="outline" size="sm">
                  <Package className="h-3 w-3 mr-1" />
                  {bundle.itemCount} products
                </Badge>
              </div>
              {bundle.description && (
                <p className="text-text-secondary mt-3 whitespace-pre-wrap">
                  {bundle.description}
                </p>
              )}
            </div>

            <Link
              href={`/creators/${bundle.creator.username}`}
              className="flex items-center gap-3 hover:bg-muted p-3 -mx-3 rounded-lg transition-colors"
            >
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={bundle.creator.avatar || ""} alt={creatorName} />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white font-semibold">
                  {creatorName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm text-text-primary">{creatorName}</p>
                  {bundle.creator.isVerified && (
                    <Badge variant="success" size="sm">Verified</Badge>
                  )}
                </div>
                <p className="text-xs text-text-muted">View creator profile</p>
              </div>
            </Link>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                What&apos;s included
              </h2>
              <div className="space-y-3">
                {bundle.items.map((item: any, index: number) => {
                  const product = item.product
                  const effectivePrice =
                    product.isOnSale && product.salePrice != null
                      ? product.salePrice
                      : product.price
                  const productCreator =
                    product.creator.displayName || product.creator.username
                  return (
                    <Card key={product.id}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <span className="text-lg font-bold text-text-muted w-6 text-center">
                          {index + 1}
                        </span>
                        <div className="h-14 w-14 rounded-md overflow-hidden bg-surface-subtle flex-shrink-0">
                          {product.media?.[0] ? (
                            <img
                              src={product.media[0].url}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-text-muted">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-medium text-text-primary hover:text-accent line-clamp-1 block"
                          >
                            {product.title}
                          </Link>
                          <p className="text-xs text-text-muted">by {productCreator}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {product.isOnSale && product.salePrice != null && (
                            <p className="text-xs text-text-muted line-through">
                              ${product.price.toFixed(2)}
                            </p>
                          )}
                          <p className="font-semibold text-text-primary">
                            ${effectivePrice.toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Instant access after purchase
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Download className="h-4 w-4 text-emerald-600" />
                Download all files
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Package className="h-4 w-4 text-emerald-600" />
                One purchase, everything included
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

