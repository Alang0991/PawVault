export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionToken =
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value

    if (sessionToken) {
      cookieStore.delete("next-auth.session-token")
      cookieStore.delete("__Secure-next-auth.session-token")
    }

    await createAuditLog({ action: AuditActions.USER_LOGOUT })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
