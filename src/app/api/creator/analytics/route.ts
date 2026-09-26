export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '30d'

  const now = new Date()
  const startDate = new Date()
  if (range === '7d') startDate.setDate(now.getDate() - 7)
  else if (range === '90d') startDate.setDate(now.getDate() - 90)
  else startDate.setDate(now.getDate() - 30)

  const creatorOrderIds = (
    await prisma.order.findMany({ where: { creatorId: user.id }, select: { id: true } })
  ).map((o) => o.id)

  const [
    totalProducts,
    publishedProducts,
    orders,
    topProducts,
    recentOrders,
    revenueOverTime,
    productViews,
  ] = await Promise.all([
    prisma.product.count({ where: { creatorId: user.id } }),
    prisma.product.count({ where: { creatorId: user.id, isPublished: true } }),
    prisma.order.findMany({
      where: { creatorId: user.id, createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { title: true, slug: true } } } },
        buyer: { select: { displayName: true, username: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { product: { creatorId: user.id }, order: { status: "COMPLETED" } },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { price: "desc" } },
      take: 10,
    }),
    prisma.order.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        items: { include: { product: { select: { title: true, slug: true } } } },
        buyer: { select: { displayName: true, username: true } },
      },
    }),
    prisma.$queryRaw<Array<{ date: string; revenue: number; orders: number; units: number }>>`
      SELECT 
        DATE("createdAt") as date,
        SUM("total") as revenue,
        COUNT(*) as orders,
        SUM(
          (SELECT SUM("quantity") FROM "OrderItem" WHERE "OrderItem"."orderId" = "Order"."id")
        ) as units
      FROM "Order"
      WHERE "creatorId" = ${user.id} AND "createdAt" >= ${startDate} AND "status" = 'COMPLETED'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.product.findMany({
      where: { creatorId: user.id },
      select: { 
        id: true, 
        title: true, 
        slug: true,
        _count: { select: { reviews: true, favorites: true } }
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
  ])

  const completed = orders.filter((o) => o.status === "COMPLETED")
  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0)
  const unitsSold = completed.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0,
  )
  const avgOrder = completed.length > 0 ? totalRevenue / completed.length : 0

  const topProductsWithTitles = await Promise.all(
    topProducts.map(async (tp) => {
      const product = await prisma.product.findUnique({
        where: { id: tp.productId },
        select: { id: true, title: true, slug: true },
      })
      return {
        ...tp,
        title: product?.title || "Unknown",
        slug: product?.slug || "",
        conversionRate: tp._sum.quantity ? Math.min((tp._sum.quantity / 100) * 100, 100) : 0, // Placeholder
      }
    })
  )

  // Mock traffic sources and device stats (would come from analytics tracking)
  const trafficSources = [
    { source: "Direct", visits: 1240, percentage: 45 },
    { source: "Search", visits: 890, percentage: 32 },
    { source: "Social", visits: 420, percentage: 15 },
    { source: "Referral", visits: 220, percentage: 8 },
  ]

  const deviceStats = [
    { device: "Desktop", visits: 1850, percentage: 67 },
    { device: "Mobile", visits: 780, percentage: 28 },
    { device: "Tablet", visits: 140, percentage: 5 },
  ]

  const topCountries = [
    { country: "United States", visits: 1200, percentage: 43 },
    { country: "United Kingdom", visits: 450, percentage: 16 },
    { country: "Canada", visits: 280, percentage: 10 },
    { country: "Germany", visits: 220, percentage: 8 },
    { country: "Australia", visits: 180, percentage: 6 },
    { country: "Other", visits: 470, percentage: 17 },
  ]

  const productViewsWithRate = productViews.map((p) => ({
    ...p,
    views: Math.floor(Math.random() * 5000) + 100, // Placeholder
    conversionRate: Math.random() * 5, // Placeholder
  }))

  return NextResponse.json({
    range,
    totalProducts,
    publishedProducts,
    totalRevenue,
    orders: orders.length,
    unitsSold,
    avgOrder,
    topProducts: topProductsWithTitles,
    recentOrders: orders.slice(0, 20),
    revenueOverTime: revenueOverTime.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
      units: Number(r.units),
    })),
    trafficSources,
    deviceStats,
    topCountries,
    productViews: productViewsWithRate,
  })
}