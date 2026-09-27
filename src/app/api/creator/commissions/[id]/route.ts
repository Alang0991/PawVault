import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCreatorAccess } from "@/lib/creator-access"

export const dynamic = "force-dynamic"

const AVAILABILITY_VALUES = ["open", "limited", "closed"] as const

/** Toggle a single commission service on or off. */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const access = await getCreatorAccess()
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.error, code: access.code },
      { status: access.status }
    )
  }

  // Scoped to the caller so one creator cannot edit another's listing.
  const existing = await prisma.serviceProvider.findFirst({
    where: { id: params.id, userId: access.userId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Commission not found" }, { status: 404 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const data: Record<string, unknown> = {}

  if (typeof body.isActive === "boolean") data.isActive = body.isActive

  if (typeof body.availability === "string") {
    if (!AVAILABILITY_VALUES.includes(body.availability as any)) {
      return NextResponse.json({ error: "Invalid availability" }, { status: 400 })
    }
    data.availability = body.availability
  }

  if (body.startingPrice !== undefined) {
    const price = Number(body.startingPrice)
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "Starting price must be zero or more" },
        { status: 400 }
      )
    }
    data.startingPrice = price
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  try {
    const service = await prisma.serviceProvider.update({
      where: { id: existing.id },
      data,
    })
    return NextResponse.json({ service })
  } catch (error) {
    console.error("Failed to update commission service:", error)
    return NextResponse.json(
      { error: "Could not update the commission. Please try again." },
      { status: 500 }
    )
  }
}

/** Remove a commission service entirely. */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const access = await getCreatorAccess()
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.error, code: access.code },
      { status: access.status }
    )
  }

  const existing = await prisma.serviceProvider.findFirst({
    where: { id: params.id, userId: access.userId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Commission not found" }, { status: 404 })
  }

  await prisma.serviceProvider.delete({ where: { id: existing.id } })
  return NextResponse.json({ ok: true })
}
