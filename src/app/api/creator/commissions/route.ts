import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCreatorAccess } from "@/lib/creator-access"

export const dynamic = "force-dynamic"

const AVAILABILITY_VALUES = ["open", "limited", "closed"] as const
type Availability = (typeof AVAILABILITY_VALUES)[number]

/**
 * Creator-facing commission profile.
 *
 * Writes to ServiceProvider, which is the one commission model that
 * covers every service type (avatar, art, development, 3D, video) with
 * a single record per creator. The AvatarCommissioner and
 * ArtCommissioner models stay reserved for the specialist commission
 * flows that manage their own tiered pricing.
 */
export async function GET() {
  const access = await getCreatorAccess()
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.error, code: access.code },
      { status: access.status }
    )
  }

  const services = await prisma.serviceProvider.findMany({
    where: { userId: access.userId },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  })

  return NextResponse.json({ services })
}

export async function POST(request: Request) {
  const access = await getCreatorAccess()
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.error, code: access.code },
      { status: access.status }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const {
    title,
    description,
    serviceType,
    serviceCategory,
    startingPrice,
    availability,
    turnaroundDays,
    tags,
    portfolioImages,
  } = body ?? {}

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "A title is required" }, { status: 400 })
  }
  if (typeof serviceType !== "string" || !serviceType.trim()) {
    return NextResponse.json({ error: "A service type is required" }, { status: 400 })
  }

  const price = Number(startingPrice)
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { error: "Starting price must be zero or more" },
      { status: 400 }
    )
  }

  const turnaround = Number(turnaroundDays)
  if (!Number.isInteger(turnaround) || turnaround < 1 || turnaround > 365) {
    return NextResponse.json(
      { error: "Turnaround must be between 1 and 365 days" },
      { status: 400 }
    )
  }

  const status: Availability = AVAILABILITY_VALUES.includes(availability)
    ? availability
    : "open"

  const cleanStringList = (value: unknown, max = 12) =>
    Array.isArray(value)
      ? value
          .filter((v): v is string => typeof v === "string")
          .map((v) => v.trim())
          .filter(Boolean)
          .slice(0, max)
      : []

  try {
    const service = await prisma.serviceProvider.create({
      data: {
        userId: access.userId,
        title: title.trim().slice(0, 120),
        description: typeof description === "string" ? description.trim().slice(0, 1000) : "",
        serviceType: serviceType.trim().slice(0, 60),
        serviceCategory:
          typeof serviceCategory === "string" && serviceCategory.trim()
            ? serviceCategory.trim().slice(0, 60)
            : "General",
        startingPrice: price,
        availability: status,
        turnaroundDays: turnaround,
        tags: cleanStringList(tags, 8),
        portfolioImages: cleanStringList(portfolioImages, 8),
        isActive: true,
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error("Failed to create commission service:", error)
    return NextResponse.json(
      { error: "Could not save the commission. Please try again." },
      { status: 500 }
    )
  }
}
