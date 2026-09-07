import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { ROLES } from "@/lib/roles"

export async function requireCreatorAccess(userId: string, userRole: string) {
  const fullUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { creatorStatus: true, role: true },
  })

  const creatorStatus = (fullUser as any)?.creatorStatus ?? "NONE"
  const isStaff = [ROLES.ADMIN, ROLES.FOUNDER, ROLES.MODERATOR].includes(userRole as any)
  if (!["APPROVED"].includes(creatorStatus) && !isStaff) {
    return NextResponse.json({ error: "Creator account required" }, { status: 403 })
  }
  return null
}

export const CREATOR_HUB_ROLES = [
  ROLES.CREATOR,
  "VERIFIED_CREATOR",
  ROLES.ADMIN,
  ROLES.FOUNDER,
] as const

export function canAccessCreatorHub(user: { role: string } | null | undefined): boolean {
  if (!user) return false
  return CREATOR_HUB_ROLES.includes(user.role as any)
}

export function canManageCreatorsAsStaff(role: string | null | undefined): boolean {
  if (!role) return false
  return role === ROLES.FOUNDER || role === ROLES.ADMIN
}

export function hasCreatorApprovalPermission(
  role: string | null | undefined,
  customPermissions: string | null | undefined,
  permission: "CREATOR_APPROVAL_VIEW" | "CREATOR_APPROVAL_REVIEW" | "CREATOR_APPROVAL_APPROVE" | "CREATOR_APPROVAL_REJECT",
): boolean {
  if (!role) return false
  if (role === ROLES.FOUNDER) return true
  if (role === ROLES.ADMIN) return true
  if (customPermissions) {
    const list = customPermissions.split(",").map((p) => p.trim()).filter(Boolean)
    const map: Record<string, string> = {
      CREATOR_APPROVAL_VIEW: "creator_approval.view",
      CREATOR_APPROVAL_REVIEW: "creator_approval.review",
      CREATOR_APPROVAL_APPROVE: "creator_approval.approve",
      CREATOR_APPROVAL_REJECT: "creator_approval.reject",
    }
    return list.includes(map[permission])
  }
  return false
}
