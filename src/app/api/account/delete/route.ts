export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { verifyPassword } from "@/lib/helpers"

const deleteSchema = z.object({
  password: z.string().min(8),
  confirm: z.literal("DELETE MY ACCOUNT"),
})

export async function DELETE(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true, role: true },
    })

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const valid = await verifyPassword(parsed.data.password, fullUser.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 })
    }

    if (["ADMIN", "FOUNDER"].includes(fullUser.role)) {
      return NextResponse.json({ error: "Cannot delete admin/founder account via this method" }, { status: 403 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId: user.id } })
      await tx.wishlistItem.deleteMany({ where: { userId: user.id } })
      await tx.favorite.deleteMany({ where: { userId: user.id } })
      await tx.review.deleteMany({ where: { userId: user.id } })
      await tx.notification.deleteMany({ where: { userId: user.id } })
      await tx.license.deleteMany({ where: { userId: user.id } })
      await tx.order.deleteMany({ where: { buyerId: user.id } })
      await tx.cart.deleteMany({ where: { userId: user.id } })
      await tx.recentlyViewed.deleteMany({ where: { userId: user.id } })
      await tx.follower.deleteMany({ where: { followerId: user.id } })
      await tx.follower.deleteMany({ where: { followingId: user.id } })
      await tx.emailPreference.deleteMany({ where: { userId: user.id } })
      await tx.stripeConnectedAccount.deleteMany({ where: { userId: user.id } })
      await tx.creatorApplication.deleteMany({ where: { userId: user.id } })
      await tx.auditLog.deleteMany({ where: { userId: user.id } })
      await tx.user.delete({ where: { id: user.id } })
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.ADMIN_USER_BANNED,
      details: { event: "account_self_deleted" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}