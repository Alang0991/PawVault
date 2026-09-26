import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const availability = searchParams.get("availability")
    const type = searchParams.get("type")
    const q = searchParams.get("q")
    const sort = searchParams.get("sort") || "featured"
    const minPrice = parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "5000")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = {
      isActive: true,
      serviceType: "avatar-commissions",
    }

    if (availability) {
      where.availability = availability
    }

    if (type) {
      where.commissionTypes = { has: type }
    }

    if (category) {
      where.categories = { has: category }
    }

    if (q) {
      where.OR = [
        { displayName: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q] } },
        { commissionTypes: { hasSome: [q] } },
        { categories: { hasSome: [q] } },
      ]
    }

    // Price filtering - need to check pricing array
    where.pricing = {
      some: {
        minPrice: { lte: maxPrice },
        maxPrice: { gte: minPrice },
      },
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
        orderBy.pricing = { _min: { minPrice: "asc" } }
        break
      case "price_desc":
        orderBy.pricing = { _max: { maxPrice: "desc" } }
        break
      case "newest":
        orderBy.createdAt = "desc"
        break
      case "turnaround":
        orderBy.turnaroundDays = "asc"
        break
      case "slots":
        orderBy.openSlots = "desc"
        break
      case "featured":
      default:
        orderBy = [{ isFeatured: "desc" }, { rating: "desc" }]
        break
    }

    const commissioners = await prisma.avatarCommissioner.findMany({
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
            isVerified: true,
          },
        },
      },
    })

    return NextResponse.json({ commissioners })
  } catch (error) {
    console.error("Failed to fetch avatar commissioners:", error)
    return NextResponse.json({ error: "Failed to fetch avatar commissioners" }, { status: 500 })
  }
}