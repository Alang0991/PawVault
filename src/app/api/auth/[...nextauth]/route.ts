export const dynamic = 'force-dynamic'

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const handler = NextAuth(authOptions)

const configuredProviderIds = authOptions.providers.map((p) => p.id)

export async function GET(req: NextRequest, ctx: any) {
  const match = req.nextUrl.pathname.match(/\/api\/auth\/callback\/([^/]+)/)
  if (match && !configuredProviderIds.includes(match[1])) {
    const url = new URL("/auth/error?error=Configuration", req.nextUrl.origin)
    return NextResponse.redirect(url)
  }
  return handler(req, ctx)
}

export async function POST(req: NextRequest, ctx: any) {
  return handler(req, ctx)
}
