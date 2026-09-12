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
    const { productId, bundleId, quantity = 1 } = body

    if (!productId && !bundleId) {
      return NextResponse.json(
        { error: "Product ID or bundle ID is required" },
        { status: 400 }
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

    if (bundleId) {
      const bundle = await prisma.bundle.findUnique({
        where: { id: bundleId },
        include: {
          items: {
            orderBy: { order: "asc" },
            include: {
              product: {
                select: {
                  id: true,
                  isPublished: true,
                  status: true,
                  creatorId: true,
                },
              },
            },
          },
        },
      })

      if (!bundle) {
        return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
      }
      if (!bundle.isPublished) {
        return NextResponse.json({ error: "This bundle is not available" }, { status: 400 })
      }
      if (user && bundle.creatorId === user.id) {
        return NextResponse.json(
          { error: "You cannot purchase your own bundle" },
          { status: 400 }
        )
      }

      const unavailableItems = bundle.items.filter(
        (item) => !item.product.isPublished || item.product.status !== "PUBLISHED"
      )
      if (unavailableItems.length > 0) {
        return NextResponse.json(
          { error: "One or more products in this bundle are no longer available" },
          { status: 400 }
        )
      }

      if (user) {
        const ownedProductIds = new Set(
          (
            await prisma.license.findMany({
              where: { userId: user.id, status: "ACTIVE" },
              select: { productId: true },
            })
          ).map((l) => l.productId)
        )
        const duplicateItems = bundle.items.filter((item) =>
          ownedProductIds.has(item.product.id)
        )
        if (duplicateItems.length > 0) {
          return NextResponse.json(
            { error: "You already own one or more products in this bundle" },
            { status: 400 }
          )
        }
      }

      const createdItems = []
      for (const bundleItem of bundle.items) {
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId: bundleItem.productId,
          },
        })

        if (existingItem) {
          createdItems.push(
            await prisma.cartItem.update({
              where: { id: existingItem.id },
              data: {
                quantity: existingItem.quantity + quantity,
                bundleId: bundle.id,
              },
              include: {
                product: {
                  include: {
                    media: { where: { isThumbnail: true }, take: 1 },
                  },
                },
              },
            })
          )
        } else {
          createdItems.push(
            await prisma.cartItem.create({
              data: {
                cartId: cart.id,
                productId: bundleItem.productId,
                bundleId: bundle.id,
                quantity,
              },
              include: {
                product: {
                  include: {
                    media: { where: { isThumbnail: true }, take: 1 },
                  },
                },
              },
            })
          )
        }
      }

      return NextResponse.json({ items: createdItems, bundleId: bundle.id }, { status: 201 })
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
