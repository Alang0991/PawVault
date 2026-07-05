export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(100),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    const body = await request.json()
    const validated = updateQuantitySchema.parse(body)

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { cart: true },
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: "Import Queue item not found" },
        { status: 404 }
      )
    }

    if (user && cartItem.cart.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updated = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity: validated.quantity },
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

    return NextResponse.json({ item: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Update cart item error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { cart: true },
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: "Import Queue item not found" },
        { status: 404 }
      )
    }

    if (user && cartItem.cart.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.cartItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete cart item error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
