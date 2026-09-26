export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { requireCreatorApprovalView } from "@/lib/server-auth"
import {
  authorizationErrorResponse,
  authenticationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-helpers"

const querySchema = z.object({
  status: z.enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional(),
  take: z.coerce.number().int().min(1).max(200).optional(),
})

export async function GET(request: Request) {
  try {
    let ctx
    try {
      ctx = await requireCreatorApprovalView()
    } catch (authError: any) {
      const status = authError?.status
      if (status === 401) return authenticationErrorResponse(authError.message)
      if (status === 403) return authorizationErrorResponse(authError.message)
      throw authError
    }

    const url = new URL(request.url)
    const parsed = querySchema.safeParse({
      status: url.searchParams.get("status") ?? undefined,
      take: url.searchParams.get("take") ?? undefined,
    })
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }

    const where = parsed.data.status ? { status: parsed.data.status } : undefined

    const applications = await prisma.creatorApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parsed.data.take ?? 100,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            role: true,
            creatorStatus: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("List creator applications error:", error)
    return serverErrorResponse()
  }
}