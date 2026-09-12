import { prisma } from '@/lib/prisma'

export const DEFAULT_PLATFORM_FEE_PERCENT = 10

export const DEFAULT_TAX_RATE_PERCENT = 10

export interface PlatformFeeBreakdown {
  feePercent: number
  currency: string
}

export interface TaxBreakdown {
  ratePercent: number
  amount: number
}

export async function getPlatformFeeConfig(): Promise<PlatformFeeBreakdown> {
  const row = await prisma.platformConfig.findUnique({
    where: { id: 'singleton' },
  })
  if (!row) {
    return {
      feePercent: DEFAULT_PLATFORM_FEE_PERCENT,
      currency: process.env.STRIPE_DEFAULT_CURRENCY || 'USD',
    }
  }
  return {
    feePercent: row.platformFeePercent,
    currency: row.currency,
  }
}

export function calculatePlatformFee(amount: number, feePercent: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  const pct = Math.max(0, Math.min(100, feePercent))
  return Math.round(amount * (pct / 100) * 100) / 100
}

export function calculateCreatorEarnings(amount: number, platformFee: number): number {
  return Math.max(0, Math.round((amount - platformFee) * 100) / 100)
}

export function calculateTax(amount: number, taxRate: number = DEFAULT_TAX_RATE_PERCENT): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  const pct = Math.max(0, Math.min(100, taxRate))
  return Math.round(amount * (pct / 100) * 100) / 100
}

export function toStripeAmount(amountMajor: number): number {
  return Math.max(0, Math.round(amountMajor * 100))
}