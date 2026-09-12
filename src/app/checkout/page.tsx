import { getServerUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getPlatformFeeConfig, calculatePlatformFee, calculateTax, DEFAULT_TAX_RATE_PERCENT } from "@/lib/platform-fees"
import { CheckoutActions } from "@/components/checkout-actions"
import { AdultContentPreview } from "@/components/adult-content-preview"
import { Price } from "@/components/price"
import { formatCurrency, BASE_CURRENCY } from "@/lib/currency"
import { getUserLocale } from "@/lib/i18n/server"
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

  const { locale, currency: userCurrency } = await getUserLocale()
  const paymentCurrency = userCurrency || BASE_CURRENCY

  function formatPriceDisplay(amount: number) {
    return formatCurrency(amount, paymentCurrency, locale)
  }

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
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to cart
              </Link>
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Checkout
          </h1>
          <p className="text-sm text-text-secondary mb-8">
            {lineItems.length} item{lineItems.length === 1 ? "" : "s"} · Secure Stripe checkout
          </p>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar || ""} alt={user.displayName || user.username} />
                  <AvatarFallback>{user.displayName?.[0] || user.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-text-primary">Customer Details</h2>
                  <p className="text-sm text-text-muted">{user.displayName || user.username}</p>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-text-muted">
                  Billing details will be collected securely during Stripe checkout. By completing your purchase you agree to the Terms of Service and Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            {/* Order summary */}
            <div className="space-y-4">
              {lineItems.map((item) => {
                const product = item.product
                const thumbnail = product.media?.[0]
                const creatorName =
                  product.creator.displayName || product.creator.username

                return (
                  <Card key={item.id}>
                    <CardContent className="flex gap-4 p-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded border bg-surface-subtle">
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
                          <div className="h-16 w-16 flex items-center justify-center text-text-muted">
                            <ShoppingCart className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm text-text-primary line-clamp-1">
                              {product.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Avatar className="h-4 w-4">
                                <AvatarImage
                                  src={product.creator.avatar || ""}
                                  alt={creatorName}
                                />
                                <AvatarFallback className="text-[8px]">
                                  {creatorName[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-text-muted">
                                {creatorName}
                              </span>
                            </div>
                          </div>
                          <Price
                            amount={item.product.price}
                            salePrice={item.product.salePrice}
                            isFree={item.product.isFree}
                            amountClassName="text-sm"
                          />
                        </div>
                        {item.quantity > 1 && (
                          <p className="text-xs text-text-muted mt-1">
                            Qty: {item.quantity}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Payment summary */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SummaryRow label="Subtotal" value={formatPriceDisplay(subtotal)} />
                  <SummaryRow
                    label={`Platform fee (${feeConfig.feePercent}%)`}
                    value={formatPriceDisplay(platformFee)}
                  />
                  <SummaryRow label="Taxes" value={formatPriceDisplay(tax)} />
                  <div className="border-t pt-3">
                    <SummaryRow label="Total" value={formatPriceDisplay(total)} bold />
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4 pt-0">
                  <CheckoutActions cartId={cart.id} paymentCurrency={paymentCurrency} />
                  <p className="text-xs text-text-muted text-center">
                    You will be redirected to Stripe to complete your purchase
                    securely.
                  </p>
                </CardFooter>
              </Card>
            </div>
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
