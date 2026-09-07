export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/session'
import { getStripe, stripeConnectEnabled } from '@/lib/stripe'
import { getPlatformFeeConfig, calculatePlatformFee, calculateCreatorEarnings, toStripeAmount } from '@/lib/platform-fees'
import { stripeLog } from '@/lib/stripe-logger'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'
import { z } from 'zod'

const checkoutSchema = z.object({
  cartId: z.string().min(1),
  couponCode: z.string().optional(),
})

interface CreatorGroup {
  creatorId: string
  stripeAccountId: string | null
  items: Array<{
    cartItemId: string
    productId: string
    title: string
    slug: string
    version: string | null
    price: number
    quantity: number
    mediaUrls: string[]
    contentRating: string
  }>
  subtotal: number
  platformFee: number
}

export async function POST(request: Request) {
  const user = await getServerUser()
  const body = await request.json().catch(() => null)
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const stripe = getStripe()
  if (!stripe) return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })

  const cart = await prisma.cart.findUnique({
    where: { id: parsed.data.cartId },
    include: {
      items: {
        include: {
          product: {
            include: {
              media: { where: { isThumbnail: true }, take: 1 },
              creator: {
                select: {
                  id: true,
                  email: true,
                  stripeConnectedAccount: { select: { stripeAccountId: true, chargesEnabled: true, payoutsEnabled: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!cart || cart.items.length === 0) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  if (user && cart.userId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invalidItems = cart.items.filter((item) => item.product.creatorId === user?.id)
  if (invalidItems.length > 0) {
    return NextResponse.json({ error: 'You cannot purchase your own products' }, { status: 400 })
  }

  const unavailableItems = cart.items.filter(
    (item) => !item.product.isPublished || (item.product.status !== 'PUBLISHED')
  )
  if (unavailableItems.length > 0) {
    return NextResponse.json({ error: 'One or more products are no longer available' }, { status: 400 })
  }

  if (user) {
    const ownedProductIds = new Set(
      (await prisma.license.findMany({
        where: { userId: user.id, status: 'ACTIVE' },
        select: { productId: true },
      })).map((l) => l.productId)
    )

    const duplicateItems = cart.items.filter((item) => ownedProductIds.has(item.productId))
    if (duplicateItems.length > 0) {
      return NextResponse.json({ error: 'You already own one or more products in your cart' }, { status: 400 })
    }
  }

  const feeConfig = await getPlatformFeeConfig()
  const lineSubtotals = new Map<string, number>()

  const groups = new Map<string, CreatorGroup>()
  let subtotal = 0
  for (const item of cart.items) {
    const effectivePrice = item.product.isOnSale && item.product.salePrice != null
      ? item.product.salePrice
      : item.product.price
    const lineSubtotal = effectivePrice * item.quantity
    subtotal += lineSubtotal
    lineSubtotals.set(item.id, lineSubtotal)

    const creatorId = item.product.creatorId
    const group = groups.get(creatorId) ?? {
      creatorId,
      stripeAccountId: item.product.creator?.stripeConnectedAccount?.stripeAccountId ?? null,
      items: [],
      subtotal: 0,
      platformFee: 0,
    }

    group.items.push({
      cartItemId: item.id,
      productId: item.productId,
      title: item.product.title,
      slug: item.product.slug,
      version: item.product.version,
      price: effectivePrice,
      quantity: item.quantity,
      mediaUrls: item.product.media.map((m) => m.url),
      contentRating: item.product.contentRating,
    })
    group.subtotal += lineSubtotal
    groups.set(creatorId, group)
  }

  let discount = 0
  let couponRecord: { id: string; code: string } | null = null
  if (parsed.data.couponCode) {
    const code = parsed.data.couponCode.toUpperCase()
    const coupon = await prisma.coupon.findUnique({ where: { code } })
    if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date()) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) {
      return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 })
    }
    if (coupon.type === 'percentage') discount = subtotal * (coupon.amount / 100)
    else discount = coupon.amount
    discount = Math.min(discount, subtotal)
    couponRecord = { id: coupon.id, code: coupon.code }
    await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
  }

  for (const group of groups.values()) {
    group.platformFee = calculatePlatformFee(group.subtotal, feeConfig.feePercent)
  }

  const total = Math.max(0, subtotal - discount)
  const discountRatio = subtotal > 0 ? (subtotal - discount) / subtotal : 1

  const orderGroup = await prisma.orderGroup.create({
    data: {
      buyerId: user?.id ?? null,
      creatorCount: groups.size,
      itemCount: cart.items.length,
      subtotal,
      discount,
      total,
      currency: feeConfig.currency,
      status: 'PENDING',
    },
  })

  const orders: { id: string; checkoutUrl: string; creatorId: string; total: number }[] = []
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  for (const group of groups.values()) {
    const adjustedSubtotal = Math.round(group.subtotal * discountRatio * 100) / 100
    const adjustedFee = calculatePlatformFee(adjustedSubtotal, feeConfig.feePercent)
    const adjustedEarnings = calculateCreatorEarnings(adjustedSubtotal, adjustedFee)

    const order = await prisma.order.create({
      data: {
        orderGroupId: orderGroup.id,
        buyerId: user?.id ?? null,
        creatorId: group.creatorId,
        subtotal: group.subtotal,
        discount: group.subtotal - adjustedSubtotal,
        total: adjustedSubtotal,
        currency: feeConfig.currency,
        status: 'PENDING',
        stripeAccountId: group.stripeAccountId ?? null,
        applicationFeeAmount: adjustedFee,
        items: {
          create: group.items.map((it) => {
            const lineSubtotal = it.price * it.quantity
            const adjustedLine = Math.round(lineSubtotal * discountRatio * 100) / 100
            const lineFee = calculatePlatformFee(adjustedLine, feeConfig.feePercent)
            return {
              productId: it.productId,
              price: it.price,
              quantity: it.quantity,
              creatorEarnings: calculateCreatorEarnings(adjustedLine, lineFee),
              platformFeeShare: lineFee,
              contentRatingSnapshot: it.contentRating,
              productTitleSnapshot: it.title,
              productSlugSnapshot: it.slug,
              productVersionSnapshot: it.version,
            }
          }),
        },
      },
    })

    let checkoutUrl: string
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: group.items.map((it) => ({
          price_data: {
            currency: feeConfig.currency.toLowerCase(),
            product_data: {
              name: it.title,
              images: it.mediaUrls,
            },
            unit_amount: toStripeAmount(it.price),
          },
          quantity: it.quantity,
        })),
        ...(group.stripeAccountId && stripeConnectEnabled()
          ? {
              payment_intent_data: {
                application_fee_amount: toStripeAmount(adjustedFee),
                transfer_data: {
                  destination: group.stripeAccountId,
                },
                metadata: {
                  pawvaultOrderId: order.id,
                  pawvaultCreatorId: group.creatorId,
                  pawvaultFeePercent: String(feeConfig.feePercent),
                },
              },
            }
          : {
              payment_intent_data: {
                metadata: {
                  pawvaultOrderId: order.id,
                  pawvaultCreatorId: group.creatorId,
                  pawvaultPlatformSale: '1',
                },
              },
            }),
        success_url: `${appUrl}/checkout/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/cart?cancelled=1`,
        metadata: {
          pawvaultOrderId: order.id,
          pawvaultOrderGroupId: orderGroup.id,
          pawvaultCreatorId: group.creatorId,
        },
      })
      checkoutUrl = session.url ?? ''
      await prisma.order.update({
        where: { id: order.id },
        data: { checkoutSessionId: session.id, paymentIntentId: (session.payment_intent as string) ?? null },
      })
    } catch (err) {
      stripeLog.error('Failed to create Stripe Checkout session', {
        orderId: order.id,
        creatorId: group.creatorId,
        result: 'error',
        category: 'checkout_session_create',
      })
      return NextResponse.json({ error: 'Could not create checkout session' }, { status: 502 })
    }

    orders.push({ id: order.id, checkoutUrl, creatorId: group.creatorId, total: order.total })
  }

  if (couponRecord) {
    await createAuditLog({
      userId: user?.id,
      action: AuditActions.ORDER_CREATED,
      details: { orderGroupId: orderGroup.id, couponCode: couponRecord.code, total },
    })
  }

  return NextResponse.json({
    orderGroupId: orderGroup.id,
    orders,
    checkoutUrl: orders[0]?.checkoutUrl,
    multiCreator: orders.length > 1,
  })
}