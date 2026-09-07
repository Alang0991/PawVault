export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'
import { z } from 'zod'

const reconcileSchema = z.object({
  dryRun: z.boolean().default(false),
})

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user || user.role !== 'FOUNDER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = reconcileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const issues: Array<{
    type: string
    orderId?: string
    paymentId?: string
    transferId?: string
    description: string
    amount?: number
  }> = []

  // Check for payments without matching orders
  const allPayments = await prisma.payment.findMany({
    include: { order: true },
  })
  for (const p of allPayments) {
    if (!p.order) {
      issues.push({
        type: 'ORPHAN_PAYMENT',
        paymentId: p.id,
        description: `Payment ${p.id} has no matching order`,
        amount: p.amount,
      })
    }
  }

  // Check for orders paid but no transfer (when stripeAccountId exists)
  const paidOrdersNoTransfer = await prisma.order.findMany({
    where: {
      status: 'PAID',
      stripeAccountId: { not: null },
      transfers: { none: {} },
    },
    include: { payments: true },
  })
  for (const order of paidOrdersNoTransfer) {
    issues.push({
      type: 'MISSING_TRANSFER',
      orderId: order.id,
      description: `Order ${order.id} is paid but has no transfer record`,
      amount: order.total,
    })
  }

  // Check for transfers with amount mismatch
  const transfers = await prisma.stripeTransfer.findMany({
    include: { allocations: true },
  })
  for (const transfer of transfers) {
    const allocationSum = transfer.allocations.reduce((s, a) => s + a.netAmount, 0)
    if (Math.abs(allocationSum - transfer.amount) > 0.01) {
      issues.push({
        type: 'AMOUNT_MISMATCH',
        transferId: transfer.id,
        description: `Transfer ${transfer.id} amount ${transfer.amount} doesn't match allocations ${allocationSum}`,
        amount: transfer.amount,
      })
    }
  }

  // Check for duplicate allocations
  const duplicateAllocations = await prisma.$queryRaw`
    SELECT "orderItemId", COUNT(*) as cnt
    FROM "CreatorAllocation"
    GROUP BY "orderItemId"
    HAVING COUNT(*) > 1
  `
  if (Array.isArray(duplicateAllocations) && duplicateAllocations.length > 0) {
    issues.push({
      type: 'DUPLICATE_ALLOCATION',
      description: `Found ${duplicateAllocations.length} duplicate allocation groups`,
    })
  }

  // Check for refunds without matching payment
  const allRefunds = await prisma.refund.findMany()
  const allPaymentIds = new Set((await prisma.payment.findMany()).map((p) => p.id))
  for (const r of allRefunds) {
    if (r.paymentId && !allPaymentIds.has(r.paymentId)) {
      issues.push({
        type: 'ORPHAN_REFUND',
        description: `Refund ${r.id} has no matching payment`,
        amount: r.amount,
      })
    }
  }

  // Check for payments with amount_refunded > amount
  const overRefunded = await prisma.payment.findMany({
    where: {
      amountRefunded: { gt: prisma.payment.fields.amount },
    },
  })
  for (const p of overRefunded) {
    issues.push({
      type: 'OVER_REFUNDED',
      paymentId: p.id,
      description: `Payment ${p.id} refunded more than paid`,
      amount: p.amount,
    })
  }

  if (!parsed.data.dryRun && issues.length > 0) {
    await createAuditLog({
      userId: user.id,
      action: AuditActions.PAYMENT_RECONCILIATION_MISMATCH,
      details: { issueCount: issues.length, issues: issues.slice(0, 20) },
    })
  }

  return NextResponse.json({
    issues,
    issueCount: issues.length,
    matched: issues.length === 0,
    dryRun: parsed.data.dryRun,
  })
}