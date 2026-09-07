import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { z } from "zod"

const messageSchema = z.object({
  content: z.string().min(2).max(5000),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: params.id,
        ...(["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)
          ? {}
          : { userId: user.id }),
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const messages = await prisma.supportTicketMessage.findMany({
      where: { ticketId: params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get support messages error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: params.id,
        ...(["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)
          ? {}
          : { userId: user.id }),
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const validated = messageSchema.parse(body)

    const isStaff = ["ADMIN", "FOUNDER", "MODERATOR"].includes(user.role)

    const message = await prisma.supportTicketMessage.create({
      data: {
        ticketId: params.id,
        userId: user.id,
        content: validated.content,
        isStaff,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    if (!isStaff) {
      await prisma.supportTicket.update({
        where: { id: params.id },
        data: { status: "WAITING" },
      })
    }

    await createAuditLog({
      userId: user.id,
      action: AuditActions.PRODUCT_CREATED,
      details: { type: "support-message", ticketId: ticket.id, messageId: message.id },
      entityType: "SupportTicketMessage",
      entityId: message.id,
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Create support message error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
