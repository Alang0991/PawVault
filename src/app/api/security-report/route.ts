import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { z } from "zod"

const schema = z.object({
  type: z.enum(["vulnerability", "abuse", "phishing", "data_exposure", "other"]),
  description: z.string().min(20).max(5000),
  url: z.string().url().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const user = await getServerUser()

    const body = await request.json()
    const validated = schema.parse(body)

    await createAuditLog({
      userId: user?.id,
      action: AuditActions.SECURITY_SUSPICIOUS_ACTIVITY,
      details: {
        type: "security_report",
        reportType: validated.type,
        description: validated.description,
        url: validated.url,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Security report error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
