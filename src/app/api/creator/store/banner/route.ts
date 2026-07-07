export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { uploadFile } from "@/lib/storage"

async function updateStoreImage(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!["CREATOR", "VERIFIED_CREATOR", "ADMIN", "OWNER"].includes(user.role)) {
    return NextResponse.json({ error: "Creator account required" }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const store = await prisma.store.findUnique({ where: { userId: user.id } })
  if (!store) {
    return NextResponse.json({ error: "Store not found. Create a store first." }, { status: 404 })
  }

  const result = await uploadFile(file, { folder: "stores", userId: user.id, validation: "banner" }, request)

  const updated = await prisma.store.update({
    where: { id: store.id },
    data: { banner: result.url },
  })

  return NextResponse.json({ banner: updated.banner })
}

export async function POST(request: Request) {
  try {
    return await updateStoreImage(request)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
