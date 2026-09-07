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

  const [sales, refunds, allocations, payouts] = await Promise.all([
    prisma.order.findMany({
      where: { creatorId: user.id, status: 'PAID', paidAt: { gte: startDate } },
      include: { items: true, payments: true },
    }),
    prisma.refund.findMany({
      where: { orderId: { in: creatorOrderIds }, createdAt: { gte: startDate } },
    }),
    prisma.creatorAllocation.findMany({
      where: { creatorId: user.id, createdAt: { gte: startDate } },
    }),
    prisma.payout.findMany({
      where: { creatorId: user.id, createdAt: { gte: startDate } },
    }),
  ])

  const grossSales = sales.reduce((s, o) => s + o.total, 0)
  const totalRefunds = refunds.reduce((s, r) => s + r.amount, 0)
  const totalFees = allocations.reduce((s, a) => s + a.platformFee, 0)
  const totalNet = allocations.filter((a) => !a.isReversed).reduce((s, a) => s + a.netAmount, 0)
  const totalPayouts = payouts.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0)

  const pending = totalNet - totalPayouts - totalRefunds

  return NextResponse.json({
    range,
    grossSales,
    totalRefunds,
    totalFees,
    totalNet,
    totalPayouts,
    pending: Math.max(0, pending),
    orderCount: sales.length,
    refundCount: refunds.length,
    allocationCount: allocations.length,
    payoutCount: payouts.length,
  })
}