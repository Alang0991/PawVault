import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const availability = searchParams.get("availability")
    const q = searchParams.get("q")
    const sort = searchParams.get("sort") || "featured"
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = {
      isActive: true,
    }

    if (category && category !== "all") {
      where.serviceType = category
    }

    if (availability) {
      where.availability = availability
    }

    if (q) {
      where.OR = [
        { displayName: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q] } },
      ]
    }

    let orderBy: any = {}
    switch (sort) {
      case "rating":
        orderBy.rating = "desc"
        break
      case "reviews":
        orderBy.reviewCount = "desc"
        break
      case "price_asc":
        orderBy.startingPrice = "asc"
        break
      case "price_desc":
        orderBy.startingPrice = "desc"
        break
      case "newest":
        orderBy.createdAt = "desc"
        break
      case "turnaround":
        orderBy.turnaroundDays = "asc"
        break
      case "featured":
      default:
        orderBy = [{ isFeatured: "desc" }, { rating: "desc" }]
        break
    }

    const providers = await prisma.serviceProvider.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            role: true,
            isVerified: true,
          },
        },
      },
    })

    return NextResponse.json({ providers })
  } catch (error) {
    console.error("Failed to fetch service providers:", error)
    return NextResponse.json({ error: "Failed to fetch service providers" }, { status: 500 })
  }
}