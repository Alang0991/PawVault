import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { calculateTax, DEFAULT_TAX_RATE_PERCENT } from "@/lib/platform-fees"
import Link from "next/link"
import { CartItemRow } from "@/components/cart-item-row"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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

  const [cart, feePercent] = await Promise.all([getCart(user.id), getPlatformFeePercent()])

  const currency = "USD"

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

  const format = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Shopping Cart
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          {lineItems.length} item{lineItems.length === 1 ? "" : "s"} in your cart
        </p>

        {lineItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-text-muted mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              Discover something worth bringing home.
            </p>
            <Button asChild>
              <Link href="/browse">
                Browse Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              {lineItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                  <div className="border-t pt-3">
                    <SummaryRow
                      label="Total"
                      value={format(total)}
                      bold
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/browse">Continue Shopping</Link>
                  </Button>
                </CardFooter>
              </Card>
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
