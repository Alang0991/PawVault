import { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export function rateLimit(options: RateLimitOptions = { maxRequests: 100, windowMs: 900000 }) {
  return async (request: NextRequest): Promise<{ success: boolean; limit: number; remaining: number; reset: number } | null> => {
    const identifier = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown'
    
    const now = Date.now()
    const windowStart = now - options.windowMs
    
    const record = rateLimitMap.get(identifier)
    
    if (!record || record.resetTime < now) {
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + options.windowMs
      })
      return {
        success: true,
        limit: options.maxRequests,
        remaining: options.maxRequests - 1,
        reset: now + options.windowMs
      }
    }
    
    if (record.count >= options.maxRequests) {
      return {
        success: false,
        limit: options.maxRequests,
        remaining: 0,
        reset: record.resetTime
      }
    }
    
    record.count++
    return {
      success: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - record.count,
      reset: record.resetTime
    }
  }
}

export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  options?: RateLimitOptions
) {
  return async (request: NextRequest) => {
    const limiter = rateLimit(options)
    const result = await limiter(request)
    
    if (!result) {
      return handler(request)
    }
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString()
          }
        }
      )
    }
    
    const response = await handler(request)
    
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.reset.toString())
    
    return response
  }
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Clean up every minute
