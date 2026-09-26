export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { uploadFile, saveMediaRecord, deleteFile } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get("file")
    const productId = form.get("productId") as string
    const isThumbnail = form.get("isThumbnail") === "true"
    const order = parseInt((form.get("order") as string) || "0")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    if (product.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const type = (file.type.startsWith("video") ? "video" : "image") as "image" | "video"
    const result = await uploadFile(
      file,
      { folder: "products", userId: user.id, productId, validation: "productMedia" },
    )

    if (isThumbnail) {
      await prisma.productMedia.updateMany({
        where: { productId, isThumbnail: true },
        data: { isThumbnail: false },
      })
    }

    const media = await saveMediaRecord(productId, result, type, isThumbnail, order)

    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
