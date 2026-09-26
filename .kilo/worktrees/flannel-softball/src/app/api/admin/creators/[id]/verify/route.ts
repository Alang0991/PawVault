export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logAdminAction, AuditActions } from "@/lib/audit-logger"
import { requirePermission } from "@/lib/server-auth"
import {
  parseRequestBody,
  authorizationErrorResponse,
  authenticationErrorResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-helpers"
import { PERMISSIONS } from "@/lib/permissions"

const verifySchema = z.object({
  verified: z.boolean(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const parsed = await parseRequestBody(request, verifySchema)
    if (!parsed.ok) return parsed.response

    let ctx
    try {
      ctx = await requirePermission(PERMISSIONS.CREATORS_VERIFY)
    } catch (authError: any) {
      const status = authError?.status
      if (status === 401) return authenticationErrorResponse(authError.message)
      if (status === 403) return authorizationErrorResponse(authError.message)
      throw authError
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, username: true, email: true, role: true, isVerified: true },
    })
    if (!user) {
      return notFoundResponse("User not found")
    }

    if (user.role !== "CREATOR" && user.role !== "VERIFIED_CREATOR") {
      return NextResponse.json({ error: "User is not a creator" }, { status: 400 })
    }

    const previousVerified = user.isVerified
    if (previousVerified === parsed.data.verified) {
      return NextResponse.json({ success: true, idempotent: true, user })
    }

    await prisma.user.update({
      where: { id: params.id },
      data: {
        isVerified: parsed.data.verified,
        ...(parsed.data.verified && user.role === "CREATOR" ? { role: "VERIFIED_CREATOR" } : {}),
        ...(!parsed.data.verified && user.role === "VERIFIED_CREATOR" ? { role: "CREATOR" } : {}),
      },
    })

    await logAdminAction(
      ctx.id,
      parsed.data.verified ? AuditActions.CREATOR_VERIFIED : AuditActions.CREATOR_UNVERIFIED,
      { userId: params.id, username: user.username, previousVerified },
      { entityType: "User", entityId: params.id },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Verify creator error:", error)
    return serverErrorResponse()
  }
}