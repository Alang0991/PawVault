const required = ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET', 'NEXT_PUBLIC_APP_URL'] as const
const connectRequired = ['STRIPE_CONNECT_WEBHOOK_SECRET'] as const

export function validateEnv() {
  const missing: string[] = []
  for (const key of required) {
    if (!process.env[key]) missing.push(key)
  }
  if (process.env.STRIPE_CONNECT_ENABLED === 'true') {
    for (const key of connectRequired) {
      if (!process.env[key]) missing.push(key)
    }
  }
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export function getEnvWarning() {
  const warnings: string[] = []
  if (!process.env.STRIPE_CONNECT_WEBHOOK_SECRET && process.env.STRIPE_CONNECT_ENABLED === 'true') {
    warnings.push('STRIPE_CONNECT_WEBHOOK_SECRET is missing; Connect webhooks will fail signature verification.')
  }
  return warnings
}