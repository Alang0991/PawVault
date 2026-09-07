import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function requireCreatorAccess(userId: string, userRole: string) {
  const fullUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { creatorStatus: true, role: true },
  })

  const creatorStatus = (fullUser as any)?.creatorStatus ?? "NONE"
  const isStaff = ["ADMIN", "FOUNDER", "MODERATOR"].includes(userRole)
  if (!["APPROVED"].includes(creatorStatus) && !isStaff) {
    return NextResponse.json({ error: "Creator account required" }, { status: 403 })
  }
  return null
}
