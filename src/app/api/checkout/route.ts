export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const checkoutSchema = z.object({
  cartId: z.string(),
  couponCode: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    const body = await request.json()
    const validated = checkoutSchema.parse(body)

    const cart = await prisma.cart.findUnique({
      where: { id: validated.cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
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

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Import Queue is empty" },
        { status: 400 }
      )
    }

    if (user && cart.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    let discountAmount = 0
    if (validated.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: validated.couponCode.toUpperCase() },
      })

      if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date()) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) {
        return NextResponse.json(
          { error: "Invalid coupon" },
          { status: 400 }
        )
      }

      if (coupon.type === "percentage") {
        discountAmount = subtotal * (coupon.amount / 100)
      } else {
        discountAmount = coupon.amount
      }

      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      })
    }

    const total = Math.max(0, subtotal - discountAmount)

    const order = await prisma.order.create({
      data: {
        buyerId: user?.id,
        total,
        status: "PENDING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
    })

    const stripeClient = stripe()

    if (!stripeClient) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      )
    }

    const stripeSession = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.items.map((item) => ({
        price_data: {
          currency: "usd",
          asset_data: {
            name: item.product.title,
            images: item.product.media.map((m) => m.url),
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        orderId: order.id,
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: stripeSession.payment_intent as string },
    })

    return NextResponse.json({
      orderId: order.id,
      url: stripeSession.url,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Quick Import error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
