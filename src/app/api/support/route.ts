import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { z } from "zod"

const createSchema = z.object({
  subject: z.string().min(3).max(200),
  category: z.string().min(1).max(50),
  message: z.string().min(10).max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
})

export async function GET(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: any = { userId: user.id }
    if (status) where.status = status

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { messages: true } },
      },
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Get support tickets error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createSchema.parse(body)

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: validated.subject,
        category: validated.category,
        priority: validated.priority,
        status: "OPEN",
        messages: {
          create: {
            userId: user.id,
            content: validated.message,
            isStaff: false,
          },
        },
      },
      include: {
        messages: true,
        _count: { select: { messages: true } },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.PRODUCT_CREATED,
      details: { type: "support-ticket", ticketId: ticket.id, subject: ticket.subject },
      entityType: "SupportTicket",
      entityId: ticket.id,
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create support ticket error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
