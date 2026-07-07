export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { deleteFile } from "@/lib/storage"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const file = await prisma.productFile.findUnique({
      where: { id: params.id },
      include: { product: true },
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
    if (file.product.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'pawvault-uploads'
    const match = file.url.match(new RegExp(`${bucket.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/(.+)$`))
    if (match) {
      await deleteFile(match[1])
    } else {
      console.warn('Could not extract storage key from file URL:', file.url)
    }

    await prisma.productFile.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete file error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
