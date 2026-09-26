import { NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/api/auth/register", "/api/auth/login", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/auth/resend-verification"],
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const now = Date.now()

  const key = `auth_${ip}`
  const limit = 10
  const windowMs = 60 * 1000

  const store = (global as any).__authRateLimitStore ||= new Map<string, { count: number; reset: number }>()
  ;(global as any).__authRateLimitStore = store

  const record = store.get(key)
  if (!record || record.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs })
    return NextResponse.next()
  }

  if (record.count >= limit) {
    return NextResponse.json(
      { error: "Too many authentication requests. Please try again later." },
      { status: 429 }
    )
  }

  record.count++
  return NextResponse.next()
}