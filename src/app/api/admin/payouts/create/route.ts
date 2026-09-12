export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { requireStripe, stripeConnectEnabled } from '@/lib/stripe'
import { stripeLog } from '@/lib/stripe-logger'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'
import { z } from 'zod'

const createPayoutsSchema = z.object({
  creatorId: z.string().optional(),
  minimumAmount: z.number().positive().default(10),
  dryRun: z.boolean().default(false),
  createStripePayouts: z.boolean().default(false),
})

export async function POST(request: Request) {
  const user = await getServerUser()
  if (!user || user.role !== 'FOUNDER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = createPayoutsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

  const { creatorId, minimumAmount, dryRun, createStripePayouts } = parsed.data

  try {
    const whereClause: Record<string, any> = {
      isReversed: false,
      payoutId: null,
      netAmount: { gt: 0 },
    }

    if (creatorId) {
      whereClause.creatorId = creatorId
    }

    const unpaidAllocations = await prisma.creatorAllocation.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { id: true, email: true, displayName: true, username: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    if (unpaidAllocations.length === 0) {
      return NextResponse.json({ created: 0, payouts: [], message: 'No unpaid allocations found' })
    }

    const allocationsByCreator = new Map<string, typeof unpaidAllocations>()
    for (const allocation of unpaidAllocations) {
      const existing = allocationsByCreator.get(allocation.creatorId) || []
      existing.push(allocation)
      allocationsByCreator.set(allocation.creatorId, existing)
    }

    const results = []
    let stripePayoutResults: Array<{ creatorId: string; stripePayoutId: string; amount: number }> = []

    if (createStripePayouts && !stripeConnectEnabled()) {
      return NextResponse.json({ error: 'Stripe Connect is not enabled' }, { status: 503 })
    }

    let stripe: any = null
    if (createStripePayouts) {
      try {
        stripe = requireStripe()
      } catch {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
      }
    }

    for (const [cid, allocations] of allocationsByCreator) {
      const totalAmount = allocations.reduce((sum, a) => sum + a.netAmount, 0)
      const creator = allocations[0].creator

      if (totalAmount < minimumAmount) {
        results.push({
          creatorId: cid,
          creatorName: creator.displayName || creator.username,
          skipped: true,
          reason: `Amount ${totalAmount} below minimum ${minimumAmount}`,
          amount: totalAmount,
        })
        continue
      }

      if (dryRun) {
        results.push({
          creatorId: cid,
          creatorName: creator.displayName || creator.username,
          dryRun: true,
          amount: totalAmount,
          allocationCount: allocations.length,
        })
        continue
      }

      const payout = await prisma.payout.create({
        data: {
          creatorId: cid,
          amount: totalAmount,
          status: createStripePayouts ? 'PROCESSING' : 'PENDING',
          method: 'STRIPE',
          currency: 'USD',
        },
      })

      await prisma.creatorAllocation.updateMany({
        where: { id: { in: allocations.map((a) => a.id) } },
        data: { payoutId: payout.id },
      })

      let stripePayoutId: string | null = null
      if (createStripePayouts && stripe) {
        const stripeAcct = await prisma.stripeConnectedAccount.findUnique({ where: { userId: cid } })
        if (stripeAcct?.payoutsEnabled) {
          try {
            const stripePayout = await stripe.payouts.create({
              amount: Math.round(totalAmount * 100),
              currency: 'usd',
              destination: stripeAcct.stripeAccountId,
              metadata: {
                pawvaultPayoutId: payout.id,
                pawvaultCreatorId: cid,
              },
            })
            const createdStripePayoutId = stripePayout.id
            stripePayoutId = createdStripePayoutId
            await prisma.payout.update({
              where: { id: payout.id },
              data: { stripePayoutId: createdStripePayoutId, status: 'PAID', processedAt: new Date() },
            })
            stripePayoutResults.push({ creatorId: cid, stripePayoutId: createdStripePayoutId, amount: totalAmount })
          } catch (err) {
            stripeLog.error('Failed to create Stripe payout', {
              creatorId: cid,
              transferId: payout.id,
              result: 'error',
              category: 'payout_create',
            })
            await prisma.payout.update({
              where: { id: payout.id },
              data: { status: 'FAILED' },
            })
            results.push({
              creatorId: cid,
              creatorName: creator.displayName || creator.username,
              failed: true,
              reason: err instanceof Error ? err.message : 'Stripe payout failed',
              amount: totalAmount,
              payoutId: payout.id,
            })
            continue
          }
        } else {
          await prisma.payout.update({
            where: { id: payout.id },
            data: { status: 'PENDING' },
          })
        }
      }

      results.push({
        creatorId: cid,
        creatorName: creator.displayName || creator.username,
        amount: totalAmount,
        allocationCount: allocations.length,
        payoutId: payout.id,
        stripePayoutId,
        status: createStripePayouts && stripePayoutId ? 'PAID' : 'PENDING',
      })
    }

    await createAuditLog({
      userId: user.id,
      action: AuditActions.PAYMENT_RECONCILIATION_MISMATCH,
      details: {
        type: 'PAYOUT_CREATION',
        payoutCount: results.filter((r) => !r.skipped && !r.dryRun && !r.failed).length,
        skippedCount: results.filter((r) => r.skipped).length,
        failedCount: results.filter((r) => r.failed).length,
        dryRun,
        createStripePayouts,
        results: results.slice(0, 20),
      },
    })

    return NextResponse.json({
      created: results.filter((r) => !r.skipped && !r.dryRun && !r.failed).length,
      skipped: results.filter((r) => r.skipped).length,
      failed: results.filter((r) => r.failed).length,
      dryRun,
      createStripePayouts,
      results,
    })
  } catch (error) {
    console.error('Create payouts error:', error)
    return NextResponse.json({ error: 'Failed to create payouts' }, { status: 500 })
  }
}