export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true, creatorId: true },
    })
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }
    if (product.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const files = await prisma.productFile.findMany({
      where: { productId: params.id },
      orderBy: [{ folder: "asc" }, { createdAt: "asc" }],
    })

    const folders = new Set<string>()
    files.forEach((f) => {
      if (f.folder) folders.add(f.folder)
    })

    return NextResponse.json({
      files: files.map((f) => ({
        id: f.id,
        filename: f.filename,
        url: f.url,
        size: f.size,
        folder: f.folder || "",
        version: f.version,
        platform: f.platform,
        createdAt: f.createdAt.toISOString(),
      })),
      folders: Array.from(folders).sort(),
    })
  } catch (error) {
    console.error("List files error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
