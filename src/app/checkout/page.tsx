import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getPlatformFeeConfig, calculatePlatformFee, calculateTax, DEFAULT_TAX_RATE_PERCENT } from "@/lib/platform-fees"
import { CheckoutActions } from "@/components/checkout-actions"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { Price } from "@/components/price"
import { BASE_CURRENCY } from "@/lib/currency"
import { getServerCurrency, makeServerPriceFormatter } from "@/lib/currency-server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ShoppingCart, ArrowLeft } from "lucide-react"

async function getCartForCheckout(userId: string) {
  return prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              creator: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  stripeConnectedAccount: true,
                },
              },
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

export default async function CheckoutPage() {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const currencyCtx = await getServerCurrency()
  const paymentCurrency = currencyCtx.currency || BASE_CURRENCY
  const formatPriceDisplay = makeServerPriceFormatter(currencyCtx)

  const cart = await getCartForCheckout(user.id)
  if (!cart || cart.items.length === 0) {
    redirect("/cart")
  }

  const feeConfig = await getPlatformFeeConfig()

  const lineItems = cart.items.map((item) => {
    const effectivePrice =
      item.product.isOnSale && item.product.salePrice != null
        ? item.product.salePrice
        : item.product.isFree
        ? 0
        : item.product.price
    return {
      ...item,
      unitPrice: effectivePrice,
      lineTotal: effectivePrice * item.quantity,
    }
  })

  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0)
  const platformFee = calculatePlatformFee(subtotal, feeConfig.feePercent)
  const tax = calculateTax(subtotal, DEFAULT_TAX_RATE_PERCENT)
  const total = subtotal + platformFee + tax

  return (
    <div className="min-h-screen bg-background">
      <div className="pv-shell py-8 md:py-10">
        <div className="max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link href="/cart">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to cart
            </Link>
          </Button>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-[32px]">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {lineItems.length} {lineItems.length === 1 ? "item" : "items"} · Secure
            Stripe checkout
          </p>

          <section className="mt-6 rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarImage
                  src={user.avatar || ""}
                  alt={user.displayName || user.username}
                />
                <AvatarFallback className="bg-muted text-sm text-text-secondary">
                  {(user.displayName || user.username)[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-text-primary">
                  Paying as {user.displayName || user.username}
                </h2>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>
            </div>
            <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-text-muted">
              Billing details are collected securely by Stripe. By completing your
              purchase you agree to the{" "}
              <Link href="/terms" className="underline underline-offset-4">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
            <ul className="divide-y divide-border rounded-xl border border-border">
              {lineItems.map((item) => {
                const product = item.product
                const thumbnail = product.media?.[0]
                const creatorName =
                  product.creator.displayName || product.creator.username

                return (
                  <li key={item.id} className="flex gap-4 p-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-subtle">
                      {thumbnail ? (
                        <AdultContentPreview
                          mediaId={thumbnail.id}
                          directUrl={thumbnail.url}
                          contentRating={product.contentRating || "SFW"}
                          alt={product.title}
                          variant="image"
                          className="h-16 w-16"
                          imgClassName="h-16 w-16 object-cover"
                          showBadge={false}
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center text-text-muted">
                          <ShoppingCart className="h-6 w-6 opacity-30" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium text-text-primary">
                          {product.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-text-muted">
                          by {creatorName}
                        </p>
                        {item.quantity > 1 && (
                          <p className="mt-1 text-xs text-text-muted">
                            Qty {item.quantity}
                          </p>
                        )}
                      </div>
                      <Price
                        amount={product.price}
                        salePrice={product.salePrice}
                        isFree={product.isFree}
                        amountClassName="text-sm shrink-0"
                      />
                    </div>
                  </li>
                )
              })}
            </ul>

            <section className="sticky top-20 h-fit rounded-xl border border-border bg-surface p-5">
              <h2 className="text-lg font-bold tracking-tight text-text-primary">
                Payment summary
              </h2>
              <div className="mt-4 space-y-3">
                <SummaryRow label="Subtotal" value={formatPriceDisplay(subtotal)} />
                <SummaryRow
                  label={`Platform fee (${feeConfig.feePercent}%)`}
                  value={formatPriceDisplay(platformFee)}
                />
                <SummaryRow label="Taxes" value={formatPriceDisplay(tax)} />
                <div className="border-t border-border pt-3">
                  <SummaryRow label="Total" value={formatPriceDisplay(total)} bold />
                </div>
              </div>

              <div className="mt-5">
                <CheckoutActions cartId={cart.id} paymentCurrency={paymentCurrency} />
                <p className="mt-3 text-center text-xs text-text-muted">
                  You&apos;ll be redirected to Stripe to complete your purchase.
                </p>
              </div>
            </section>
          </div>
        </div>
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
