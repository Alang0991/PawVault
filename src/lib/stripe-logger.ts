export type StripeLogLevel = 'info' | 'warn' | 'error'

export interface StripeLogFields {
  eventType?: string
  eventId?: string
  orderId?: string
  creatorId?: string
  stripeObjectId?: string
  stripeAccountId?: string
  result?: 'success' | 'skipped' | 'ignored' | 'error'
  category?: string
  endpoint?: string
}

function emit(level: StripeLogLevel, message: string, fields: StripeLogFields = {}) {
  const safe = {
    message,
    ...fields,
  }
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  fn('[stripe]', safe)
}

export const stripeLog = {
  info: (message: string, fields: StripeLogFields = {}) => emit('info', message, fields),
  warn: (message: string, fields: StripeLogFields = {}) => emit('warn', message, fields),
  error: (message: string, fields: StripeLogFields = {}) => emit('error', message, fields),
}