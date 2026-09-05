type RateLimitRecord = { count: number; reset: number }
type RateLimitStore = Map<string, RateLimitRecord>

declare global {
  var __publicRateLimitStore: RateLimitStore | undefined
}

export function rateLimit(request: Request, limit = 30, windowMs = 60_000): { allowed: boolean; remaining: number; reset: number } {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const key = `public_${ip}`
  const now = Date.now()

  const store = (global as any).__publicRateLimitStore ||= new Map()
  ;(global as any).__publicRateLimitStore = store

  const record = store.get(key)
  if (!record || record.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: limit - 1, reset: now + windowMs }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, reset: record.reset }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count, reset: record.reset }
}

export function getRateLimitHeaders(result: { allowed: boolean; remaining: number; reset: number }) {
  return {
    "X-RateLimit-Limit": String(30),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
  }
}
