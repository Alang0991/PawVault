export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    
    let cart = await prisma.cart.findFirst({
      where: user ? { userId: user.id } : { sessionId: request.headers.get("x-session-id") || "" },
      include: {
        items: {
          include: {
            product: {
              include: {
                media: {
                  where: { isThumbnail: true },
                  take: 1,
                },
                creator: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user?.id,
          sessionId: user ? undefined : request.headers.get("x-session-id") || `guest-1782949130459`,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  media: {
                    where: { isThumbnail: true },
                    take: 1,
                  },
                  creator: {
                    select: {
                      id: true,
                      username: true,
                      displayName: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    }

    return NextResponse.json({ cart })
  } catch (error) {
    console.error("Get cart error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    const body = await request.json()
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const sessionId = user
      ? undefined
      : request.headers.get("x-session-id") || `guest-1782949130459`

    let cart = await prisma.cart.findFirst({
      where: user ? { userId: user.id } : { sessionId },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user?.id,
          sessionId,
        },
      })
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    })

    let item
    if (existingItem) {
      item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
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
      })
    } else {
      item = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
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
      })
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
