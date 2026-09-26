export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const createVersionSchema = z.object({
  version: z.string().min(1).max(50),
  changelog: z.string().max(5000).optional(),
  releaseNotes: z.string().max(5000).optional(),
  files: z.array(z.string()).optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { productId: string } },
) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { creatorId: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.creatorId !== user.id && !["ADMIN", "FOUNDER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const versions = await prisma.productVersion.findMany({
      where: { productId: params.productId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ versions })
  } catch (error) {
    console.error("Get versions error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { productId: string } },
) {
  try {
    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { creatorId: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.creatorId !== user.id && !["ADMIN", "FOUNDER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validated = createVersionSchema.parse(body)

    const version = await prisma.productVersion.create({
      data: {
        productId: params.productId,
        version: validated.version,
        changelog: validated.changelog,
        releaseNotes: validated.releaseNotes,
        files: validated.files ? JSON.stringify(validated.files) : undefined,
      },
    })

    await prisma.product.update({
      where: { id: params.productId },
      data: { version: validated.version },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.PRODUCT_UPDATED,
      details: { productId: params.productId, version: validated.version },
    })

    return NextResponse.json({ version }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create version error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
