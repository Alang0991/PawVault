export const dynamic = 'force-dynamic'

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
	const handler = NextAuth(authOptions)
	// @ts-ignore - NextAuth returns a handler compatible with App Router requests
	return handler(request)
}

export async function POST(request: Request) {
	const handler = NextAuth(authOptions)
	// @ts-ignore - NextAuth returns a handler compatible with App Router requests
	return handler(request)
}
