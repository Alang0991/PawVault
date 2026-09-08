import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { ROLES } from "@/lib/roles"

export type CreatorAccessResult =
  | { allowed: true; userId: string; creatorStatus: string; role: string }
  | { allowed: false; error: string; status: number; code?: string }

export async function getCreatorAccess(): Promise<CreatorAccessResult> {
  const user = await getServerUser()

  if (!user) {
    return {
      allowed: false,
      error: "Authentication required",
      status: 401,
      code: "NOT_AUTHENTICATED",
    }
  }

  const creatorStatus = user.creatorStatus ?? "NONE"

  if (user.status === "BANNED") {
    return {
      allowed: false,
      error: "Account is banned",
      status: 403,
      code: "USER_BANNED",
    }
  }

  if (user.status === "SUSPENDED") {
    return {
      allowed: false,
      error: "Account is suspended",
      status: 403,
      code: "USER_SUSPENDED",
    }
  }

  const isStaff = [ROLES.ADMIN, ROLES.FOUNDER].includes(user.role as any)

  if (isStaff) {
    return {
      allowed: true,
      userId: user.id,
      creatorStatus,
      role: user.role,
    }
  }

  if (creatorStatus === "SUSPENDED") {
    return {
      allowed: false,
      error: "Creator account is suspended",
      status: 403,
      code: "CREATOR_SUSPENDED",
    }
  }

  if (creatorStatus === "BANNED") {
    return {
      allowed: false,
      error: "Creator account is banned",
      status: 403,
      code: "CREATOR_BANNED",
    }
  }

  if (creatorStatus !== "APPROVED") {
    const statusMessages: Record<string, string> = {
      NONE: "You need to apply and be approved as a creator.",
      APPLICATION_DRAFT: "Your creator application is not yet submitted.",
      APPLICATION_SUBMITTED: "Your creator application has been submitted.",
      UNDER_REVIEW: "Your creator application is under review.",
      REJECTED: "Your creator application was rejected.",
      WITHDRAWN: "Your creator application was withdrawn.",
    }
    return {
      allowed: false,
      error: statusMessages[creatorStatus] || "Creator account required",
      status: 403,
      code: "CREATOR_NOT_APPROVED",
    }
  }

  return {
    allowed: true,
    userId: user.id,
    creatorStatus,
    role: user.role,
  }
}

export async function requireCreatorAccess(): Promise<CreatorAccessResult> {
  return getCreatorAccess()
}

export async function requireCreatorAccessForStore(userId: string): Promise<{
  allowed: boolean
  error?: string
  status?: number
  store?: { id: string; slug: string } | null
  code?: string
}> {
  const access = await getCreatorAccess()

  if (!access.allowed) {
    return { allowed: false, error: access.error, status: access.status, code: access.code }
  }

  const store = await prisma.store.findUnique({
    where: { userId },
    select: { id: true, slug: true, visibility: true },
  })

  if (!store) {
    return { allowed: false, error: "Store not found", status: 404, code: "STORE_NOT_FOUND" }
  }

  if (store.visibility === "SUSPENDED") {
    return { allowed: false, error: "Store is suspended", status: 403, code: "STORE_SUSPENDED" }
  }

  return { allowed: true, store }
}

export const CREATOR_HUB_ROLES = [
  ROLES.CREATOR,
  "VERIFIED_CREATOR",
  ROLES.ADMIN,
  ROLES.FOUNDER,
  ROLES.MODERATOR,
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
