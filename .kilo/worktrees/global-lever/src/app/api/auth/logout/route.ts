export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null

    if (userId) {
      await createAuditLog({
        userId,
        action: AuditActions.USER_LOGOUT,
        details: { method: "api" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return new NextResponse(null, { status: 405 })
}