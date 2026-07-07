export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["CREATOR", "VERIFIED_CREATOR", "ADMIN", "OWNER"].includes(user.role)) {
      return NextResponse.json({ error: "Creator account required" }, { status: 403 })
    }

    const store = await prisma.store.findUnique({
      where: { userId: user.id },
      select: { id: true, name: true, slug: true, logo: true, banner: true },
    })

    let totalProducts = 0
    let publishedProducts = 0
    let draftProducts = 0
    let reviews: any[] = []
    let licenses: any[] = []
    let recentOrders: any[] = []
    let products: any[] = []

    try {
      totalProducts = await prisma.product.count({ where: { creatorId: user.id } })
      publishedProducts = await prisma.product.count({ where: { creatorId: user.id, isPublished: true } })
      draftProducts = await prisma.product.count({ where: { creatorId: user.id, isPublished: false } })
      reviews = await prisma.review.findMany({
        where: { product: { creatorId: user.id } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { id: true, username: true, displayName: true, avatar: true } },
          product: { select: { id: true, title: true, slug: true } },
        },
      })
      licenses = await prisma.license.findMany({
        where: { product: { creatorId: user.id } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { product: { select: { id: true, title: true, slug: true } } },
      })
      recentOrders = await prisma.order.findMany({
        where: { items: { some: { product: { creatorId: user.id } } } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: { include: { product: { select: { id: true, title: true, slug: true } } } },
          buyer: { select: { id: true, displayName: true, username: true, email: true } },
        },
      })
      products = await prisma.product.findMany({
        where: { creatorId: user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          category: true,
          media: { where: { isThumbnail: true }, take: 1 },
          _count: { select: { reviews: true, favorites: true } },
        },
      })
    } catch (error) {
      console.error("Creator dashboard query error:", error)
      return NextResponse.json(
        { error: "Database error. Please try again later." },
        { status: 500 }
      )
    }

    const completedOrders = await prisma.order.findMany({
      where: {
        items: { some: { product: { creatorId: user.id } } },
        status: "COMPLETED",
      },
      select: { total: true },
    })

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
    const customerIds = new Set(
      recentOrders.map((o) => o.buyer?.id).filter(Boolean) as string[],
    )

    const recentReviews = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      isVerified: r.isVerified,
      createdAt: r.createdAt,
      user: r.user,
      product: r.product,
    }))

    const recentLicenses = licenses.map((l) => ({
      id: l.id,
      status: l.status,
      createdAt: l.createdAt,
      product: l.product,
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
      store,
      productCount: totalProducts,
      publishedProducts,
      draftProducts,
      totalRevenue,
      customerCount: customerIds.size,
      licenseCount: licenses.length,
      avgRating:
        reviews.length > 0
          ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
          : 0,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
        buyer: o.buyer,
        items: o.items,
      })),
      recentReviews,
      recentLicenses,
      products,
    })
  } catch (error) {
    console.error("Creator dashboard error:", error)
    const message = error instanceof Error ? error.message : "Something went wrong"
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
