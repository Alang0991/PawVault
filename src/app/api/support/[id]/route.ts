import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { requireAdminOrFounder } from "@/lib/server-auth"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

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
      include: {
        messages: {
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
        },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Get support ticket error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isStaff = await requireAdminOrFounder()

    const body = await request.json()
    const { status, priority } = body

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    })
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const data: any = {}
    if (status) data.status = status
    if (priority) data.priority = priority

    const updated = await prisma.supportTicket.update({
      where: { id: params.id },
      data,
      include: {
        messages: {
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
        },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: isStaff.id,
      action: AuditActions.ADMIN_MODERATION_ACTION,
      details: { type: "support-ticket", ticketId: ticket.id, updates: data },
      entityType: "SupportTicket",
      entityId: ticket.id,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update support ticket error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
