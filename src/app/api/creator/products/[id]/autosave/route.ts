export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const draftSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(200).nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  salePrice: z.number().nonnegative().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  isFree: z.boolean().optional(),
  isOnSale: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  version: z.string().nullable().optional(),
  unityVersion: z.string().nullable().optional(),
  vrcSdkVersion: z.string().nullable().optional(),
  polygonCount: z.number().int().nullable().optional(),
  fileSize: z.number().int().nullable().optional(),
  questCompatible: z.boolean().optional(),
  pcCompatible: z.boolean().optional(),
  licenseType: z.string().nullable().optional(),
  slug: z.string().optional(),
  contentRating: z.enum(["SFW", "MATURE", "NSFW"]).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "You must be signed in to save a draft." }, { status: 401 })
    }

    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }
    if (product.creatorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to edit this product." }, { status: 403 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
    }

    const parsed = draftSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Some fields are invalid.", details: parsed.error.errors },
        { status: 400 },
      )
    }

    const { tags, slug, ...data } = parsed.data

    let nextSlug: string | undefined
    if (typeof slug === "string" && slug.trim().length > 0 && slug.trim() !== product.slug) {
      const candidate = slug
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
      if (candidate.length > 0) {
        const clash = await prisma.product.findFirst({
          where: { slug: candidate, NOT: { id: product.id } },
        })
        if (!clash) nextSlug = candidate
      }
    }

    const updateData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue
      if (key === "categoryId") {
        if (value === null || value === "") {
          updateData.categoryId = null
        } else {
          updateData.categoryId = value
        }
        continue
      }
      updateData[key] = value
    }
    if (nextSlug) updateData.slug = nextSlug

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.product.update({
        where: { id: product.id },
        data: updateData,
      })

      if (Array.isArray(tags)) {
        await tx.productTag.deleteMany({ where: { productId: product.id } })
        if (tags.length > 0) {
          const tagRecords = await Promise.all(
            tags.map(async (name) => {
              const tagSlug = name
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "")
              return tx.tag.upsert({
                where: { slug: tagSlug || name.toLowerCase() },
                update: {},
                create: { name, slug: tagSlug || name.toLowerCase() },
              })
            }),
          )
          await tx.productTag.createMany({
            data: tagRecords.map((t) => ({ productId: product.id, tagId: t.id })),
          })
        }
      }

      return result
    })

    return NextResponse.json({
      ok: true,
      savedAt: updated.updatedAt,
      product: {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        isPublished: updated.isPublished,
        updatedAt: updated.updatedAt,
      },
    })
  } catch (error) {
    console.error("Autosave error:", error)
    return NextResponse.json(
      { error: "We couldn't save your changes. Please try again." },
      { status: 500 },
    )
  }
}
