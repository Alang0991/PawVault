export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { getSupabaseClient, getBucket } from "@/lib/storage"

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productFile = await prisma.productFile.findUnique({
      where: { id: params.id },
      include: { product: true },
    })

    if (!productFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const isCreator = productFile.product.creatorId === user.id
    const hasPurchased = await prisma.order.findFirst({
      where: {
        buyerId: user.id,
        status: "COMPLETED",
        items: { some: { productId: productFile.productId } },
      },
    })

    if (!isCreator && !hasPurchased) {
      return NextResponse.json({ error: "You must purchase this product to download files" }, { status: 403 })
    }

    const supabase = getSupabaseClient()
    const bucket = getBucket()

    const url = new URL(productFile.url)
    const key = url.pathname.split(`/${bucket}/`)[1]
    if (!key) {
      return NextResponse.json({ error: "Invalid file URL" }, { status: 400 })
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(key, 3600)

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 })
    }

    return NextResponse.redirect(data.signedUrl)
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
