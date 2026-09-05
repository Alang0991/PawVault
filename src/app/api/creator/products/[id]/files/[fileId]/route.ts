export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const patchSchema = z.object({
  folder: z.string().nullable().optional(),
  filename: z.string().min(1).max(200).optional(),
})

function normalizeFolder(input: unknown): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/\\/g, "/")
    .split("/")
    .map((p) => p.replace(/[^a-zA-Z0-9._\- ]/g, "").replace(/^\s+|\s+$/g, ""))
    .filter((p) => p.length > 0 && p !== "..")
    .join("/")
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; fileId: string } },
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const file = await prisma.productFile.findUnique({
      where: { id: params.fileId },
      include: { product: { select: { id: true, creatorId: true } } },
    })
    if (!file) {
      return NextResponse.json({ error: "File not found." }, { status: 404 })
    }
    if (file.product.id !== params.id) {
      return NextResponse.json({ error: "File does not belong to this product." }, { status: 400 })
    }
    if (file.product.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to manage this file." }, { status: 403 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update payload." }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.filename !== undefined) {
      data.filename = parsed.data.filename
    }
    if (parsed.data.folder !== undefined) {
      const folder = parsed.data.folder === null ? "" : normalizeFolder(parsed.data.folder)
      data.folder = folder
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No changes provided." }, { status: 400 })
    }

    const updated = await prisma.productFile.update({
      where: { id: file.id },
      data,
    })

    return NextResponse.json({
      file: {
        id: updated.id,
        filename: updated.filename,
        folder: updated.folder || "",
        size: updated.size,
        url: updated.url,
        createdAt: updated.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Update file error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
