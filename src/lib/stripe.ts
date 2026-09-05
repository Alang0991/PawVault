import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!stripeInstance) {
    stripeInstance = new Stripe(key, {
      apiVersion: '2026-08-26.dahlia',
      typescript: true,
    })
  }
  return stripeInstance
}

export function requireStripe(): Stripe {
  const s = getStripe()
  if (!s) {
    throw new Error('Stripe is not configured (missing STRIPE_SECRET_KEY)')
  }
  return s
}

export function stripeConnectEnabled(): boolean {
  return process.env.STRIPE_CONNECT_ENABLED === 'true'
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export const stripe = getStripe