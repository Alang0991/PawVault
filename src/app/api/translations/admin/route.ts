export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"

const translationUpdateSchema = z.object({
  locale: z.string().min(2).max(5),
  namespace: z.string().min(1),
  key: z.string().min(1),
  value: z.string(),
})

export async function GET(request: Request) {
  try {
    const ctx = await requireFounder()

    const url = new URL(request.url)
    const locale = url.searchParams.get("locale")
    const namespace = url.searchParams.get("namespace")

    const where: any = {}
    if (locale) where.locale = locale
    if (namespace) where.namespace = namespace

    const translations = await prisma.translationKey.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [{ locale: "asc" }, { namespace: "asc" }, { key: "asc" }],
    })

    return NextResponse.json({ translations })
  } catch (error) {
    console.error("Get translations error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireFounder()

    const body = await request.json()
    const parsed = translationUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const existing = await prisma.translationKey.findFirst({
      where: {
        locale: parsed.data.locale,
        namespace: parsed.data.namespace,
        key: parsed.data.key,
      },
    })

    if (existing) {
      const updated = await prisma.translationKey.update({
        where: { id: existing.id },
        data: { value: parsed.data.value },
      })
      return NextResponse.json({ translation: updated })
    } else {
      const created = await prisma.translationKey.create({
        data: {
          locale: parsed.data.locale,
          namespace: parsed.data.namespace,
          key: parsed.data.key,
          value: parsed.data.value,
        },
      })
      return NextResponse.json({ translation: created })
    }
  } catch (error) {
    console.error("Update translation error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = await requireFounder()

    const body = await request.json()
    const idSchema = z.object({ id: z.string().min(1) })
    const parsed = idSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    await prisma.translationKey.delete({
      where: { id: body.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete translation error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
