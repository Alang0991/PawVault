export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { uploadFile, saveFileRecord } from "@/lib/storage"

function normalizeFolder(input: unknown): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/\\/g, "/")
    .split("/")
    .map((p) =>
      p
        .replace(/[^a-zA-Z0-9._\- ]/g, "")
        .replace(/^\s+|\s+$/g, ""),
    )
    .filter((p) => p.length > 0 && p !== "..")
    .join("/")
}

function safeRelativePath(input: unknown): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/\\/g, "/")
    .split("/")
    .filter((p) => p.length > 0 && p !== "..")
    .join("/")
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "You must be signed in to upload files." }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get("file")
    const productId = form.get("productId") as string
    const version = (form.get("version") as string) || undefined
    const platform = (form.get("platform") as string) || undefined
    const folder = normalizeFolder(form.get("folder"))
    const relativePath = safeRelativePath(form.get("relativePath"))

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 })
    }
    if (!productId) {
      return NextResponse.json({ error: "productId is required." }, { status: 400 })
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "This file is empty and can't be uploaded." }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }
    if (product.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to add files to this product." }, { status: 403 })
    }

    let result
    try {
      result = await uploadFile(file, {
        folder: "files",
        userId: user.id,
        productId,
        validation: "productFile",
        subPath: folder || undefined,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed."
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const saved = await saveFileRecord(user.id, productId, result, file.name, {
      version,
      platform,
      folder,
    })

    return NextResponse.json({ file: saved, relativePath }, { status: 201 })
  } catch (error) {
    console.error("Product file upload error:", error)
    return NextResponse.json(
      { error: "We couldn't upload this file. Please try again." },
      { status: 500 },
    )
  }
}
