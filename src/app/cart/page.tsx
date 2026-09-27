import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { calculateTax, DEFAULT_TAX_RATE_PERCENT } from "@/lib/platform-fees"
import { getServerCurrency, makeServerPriceFormatter } from "@/lib/currency-server"
import Link from "next/link"
import { CartItemRow } from "@/components/cart-item-row"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { ShoppingCart, ArrowRight } from "lucide-react"

async function getCart(userId: string) {
  return prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          bundle: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
            },
          },
          product: {
            include: {
              creator: true,
              media: {
                where: { isThumbnail: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  })
}

async function getPlatformFeePercent() {
  const config = await prisma.platformConfig.findUnique({
    where: { id: "singleton" },
    select: { platformFeePercent: true },
  })
  return config?.platformFeePercent ?? 10
}

export default async function CartPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const [cart, feePercent, currencyCtx] = await Promise.all([
    getCart(user.id),
    getPlatformFeePercent(),
    getServerCurrency(),
  ])

  const format = makeServerPriceFormatter(currencyCtx)

  const items = cart?.items ?? []

  // Compute bundle discounts proportionally across each bundle's items
  const bundleTotals = new Map<string, number>()
  for (const item of items) {
    if (!item.bundleId) continue
    const price =
      item.product.isOnSale && item.product.salePrice
        ? item.product.salePrice
        : item.product.isFree
        ? 0
        : item.product.price
    bundleTotals.set(
      item.bundleId,
      (bundleTotals.get(item.bundleId) ?? 0) + price * item.quantity
    )
  }

  const lineItems = items.map((item) => {
    const price =
      item.product.isOnSale && item.product.salePrice
        ? item.product.salePrice
        : item.product.isFree
        ? 0
        : item.product.price
    const lineTotal = price * item.quantity

    let adjustedLineTotal = lineTotal
    if (item.bundleId) {
      const bundle = item.bundle
      const bundleValue = bundleTotals.get(item.bundleId) ?? lineTotal
      const bundleDiscount = Math.max(0, bundleValue - (bundle?.price ?? bundleValue))
      if (bundleDiscount > 0 && bundleValue > 0) {
        adjustedLineTotal = Math.max(0, lineTotal - bundleDiscount * (lineTotal / bundleValue))
      }
    }

    return {
      ...item,
      unitPrice: price,
      lineTotal,
      adjustedLineTotal,
    }
  })

  const subtotal = lineItems.reduce((sum, i) => sum + i.adjustedLineTotal, 0)
  const bundleSavings = lineItems.reduce(
    (sum, i) => sum + (i.lineTotal - i.adjustedLineTotal),
    0
  )
  const platformFee = subtotal * (feePercent / 100)
  const tax = calculateTax(subtotal, DEFAULT_TAX_RATE_PERCENT)
  const total = subtotal + platformFee + tax

  return (
    <div className="min-h-screen bg-background">
      <div className="pv-shell py-8 md:py-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-[32px]">
          Cart
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {lineItems.length} {lineItems.length === 1 ? "item" : "items"}
        </p>

        {lineItems.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<ShoppingCart className="h-6 w-6" />}
              title="Your cart is empty."
              description="Find something worth keeping."
              action={{ label: "Browse products", href: "/browse" }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              {lineItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            <div>
              <section className="sticky top-20 rounded-xl border border-border bg-surface p-5">
                <h2 className="text-lg font-bold tracking-tight text-text-primary">
                  Order summary
                </h2>
                <div className="mt-4 space-y-3">
                  <SummaryRow label="Subtotal" value={format(subtotal)} />
                  {bundleSavings > 0 && (
                    <SummaryRow
                      label="Bundle savings"
                      value={`-${format(bundleSavings)}`}
                    />
                  )}
                  <SummaryRow
                    label={`Platform fee (${feePercent}%)`}
                    value={format(platformFee)}
                  />
                  <SummaryRow label="Taxes" value={format(tax)} />
                  <div className="border-t border-border pt-3">
                    <SummaryRow label="Total" value={format(total)} bold />
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">
                      Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/browse">Continue shopping</Link>
                  </Button>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className={bold ? "font-bold text-text-primary" : "text-text-primary"}>
        {value}
      </span>
    </div>
  )
}
