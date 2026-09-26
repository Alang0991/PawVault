export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const collection = await prisma.collection.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const body = await request.json()
    const { productId, order } = body as { productId: string; order?: number }

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.creatorId !== user.id) {
      return NextResponse.json({ error: "You can only add your own products to collections" }, { status: 403 })
    }

    const existing = await prisma.collectionItem.findFirst({
      where: { collectionId: collection.id, productId },
    })

    if (existing) {
      return NextResponse.json({ error: "Product is already in this collection" }, { status: 409 })
    }

    const maxOrder = await prisma.collectionItem.aggregate({
      where: { collectionId: collection.id },
      _max: { order: true },
    })

    const item = await prisma.collectionItem.create({
      data: {
        collectionId: collection.id,
        productId,
        order: order ?? (maxOrder._max.order ?? -1) + 1,
      },
    })

    await prisma.collection.update({
      where: { id: collection.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Add collection item error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const collection = await prisma.collection.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 })
    }

    const body = await request.json()
    const { productId } = body as { productId: string }

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const item = await prisma.collectionItem.findFirst({
      where: { collectionId: collection.id, productId },
    })

    if (!item) {
      return NextResponse.json({ error: "Product not found in collection" }, { status: 404 })
    }

    await prisma.collectionItem.delete({
      where: { id: item.id },
    })

    await prisma.collection.update({
      where: { id: collection.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove collection item error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
