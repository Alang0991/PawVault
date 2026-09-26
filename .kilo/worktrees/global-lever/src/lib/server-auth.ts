import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Role, ROLES, isFounder, isAdminOrFounder, hasRoleAtLeast, canSeeInternalAccounts } from "@/lib/roles"
import { Permission, PERMISSIONS, roleHasPermission } from "@/lib/permissions"
import { logSecurityEvent, AuditActions } from "@/lib/audit-logger"

export type AuthContext = {
  id: string
  email: string
  username: string
  displayName: string | null
  role: Role
  status: string
  customPermissions: string | null
}

export async function getViewerRole(): Promise<string | null> {
  const user = await getServerUser()
  return user?.role ?? null
}

export function internalAccountFilter<T extends string | undefined>(
  whereClause: any,
  role: string | null,
  target: "user" | "creator" = "user",
): any {
  if (canSeeInternalAccounts(role)) {
    return whereClause
  }
  if (!whereClause[target]) {
    whereClause[target] = {}
  }
  whereClause[target].isInternal = false
  return whereClause
}

export async function getViewerContext(): Promise<{ role: string | null; id: string | null }> {
  const user = await getServerUser()
  return { role: user?.role ?? null, id: user?.id ?? null }
}

export class AuthorizationError extends Error {
  status = 403
  constructor(message: string) {
    super(message)
    this.name = "AuthorizationError"
  }
}

export class AuthenticationError extends Error {
  status = 401
  constructor(message: string) {
    super(message)
    this.name = "AuthenticationError"
  }
}

export async function requireUser(): Promise<AuthContext> {
  const user = await getServerUser()
  if (!user) {
    throw new AuthenticationError("Authentication required.")
  }

  const status = (user as any).status ?? "ACTIVE"
  if (status === "BANNED") {
    throw new AuthorizationError("Account is banned.")
  }
  if (status === "SUSPENDED") {
    const u = await prisma.user.findUnique({
      where: { id: user.id },
      select: { suspendedUntil: true },
    })
    if (u?.suspendedUntil && u.suspendedUntil > new Date()) {
      throw new AuthorizationError(
        `Account is suspended until ${u.suspendedUntil.toISOString()}.`,
      )
    }
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName ?? null,
    role: user.role as Role,
    status,
    customPermissions: (user as any).customPermissions ?? null,
  }
}

export async function requireRole(min: Role): Promise<AuthContext> {
  const ctx = await requireUser()
  if (!hasRoleAtLeast(ctx.role, min)) {
    await logSecurityEvent(AuditActions.SECURITY_PRIVILEGE_ESCALATION_BLOCKED, {
      attempted: min,
      actual: ctx.role,
      path: "requireRole",
    })
    throw new AuthorizationError(`Requires ${min} role or higher.`)
  }
  return ctx
}

export async function requirePermission(permission: Permission): Promise<AuthContext> {
  const ctx = await requireUser()
  if (!roleHasPermission(ctx.role, permission, ctx.customPermissions)) {
    await logSecurityEvent(AuditActions.SECURITY_PRIVILEGE_ESCALATION_BLOCKED, {
      attempted: permission,
      actual: ctx.role,
      path: "requirePermission",
    })
    throw new AuthorizationError(`Missing permission: ${permission}`)
  }
  return ctx
}

export async function requireFounder(): Promise<AuthContext> {
  const ctx = await requireUser()
  if (!isFounder(ctx.role)) {
    await logSecurityEvent(AuditActions.SECURITY_PRIVILEGE_ESCALATION_BLOCKED, {
      attempted: "FOUNDER",
      actual: ctx.role,
      path: "requireFounder",
    })
    throw new AuthorizationError("Founder only.")
  }
  return ctx
}

export async function requireAdminOrFounder(): Promise<AuthContext> {
  const ctx = await requireUser()
  if (!isAdminOrFounder(ctx.role)) {
    await logSecurityEvent(AuditActions.SECURITY_PRIVILEGE_ESCALATION_BLOCKED, {
      attempted: "ADMIN",
      actual: ctx.role,
      path: "requireAdminOrFounder",
    })
    throw new AuthorizationError("Admin or Founder only.")
  }
  return ctx
}

export async function requireCreatorApprovalView(): Promise<AuthContext> {
  const ctx = await requireUser()
  if (
    !roleHasPermission(ctx.role, PERMISSIONS.CREATOR_APPROVAL_VIEW, ctx.customPermissions) &&
    ctx.role !== "FOUNDER"
  ) {
    await logSecurityEvent(AuditActions.SECURITY_PRIVILEGE_ESCALATION_BLOCKED, {
      attempted: "CREATOR_APPROVAL_VIEW",
      actual: ctx.role,
      path: "requireCreatorApprovalView",
    })
    throw new AuthorizationError("Missing permission: creator_approval.view")
  }
  return ctx
}

export async function requireCreatorApprovalReview(): Promise<AuthContext> {
  const ctx = await requireUser()
  if (
    !roleHasPermission(ctx.role, PERMISSIONS.CREATOR_APPROVAL_REVIEW, ctx.customPermissions) &&
    ctx.role !== "FOUNDER"
  ) {
    await logSecurityEvent(AuditActions.SECURITY_PRIVILEGE_ESCALATION_BLOCKED, {
      attempted: "CREATOR_APPROVAL_REVIEW",
      actual: ctx.role,
      path: "requireCreatorApprovalReview",
    })
    throw new AuthorizationError("Missing permission: creator_approval.review")
  }
  return ctx
}

export async function requireCreatorApprovalApprove(): Promise<AuthContext> {
  const ctx = await requireUser()
  if (
    !roleHasPermission(ctx.role, PERMISSIONS.CREATOR_APPROVAL_APPROVE, ctx.customPermissions) &&
    ctx.role !== "FOUNDER"
  ) {
    await logSecurityEvent(AuditActions.SECURITY_PRIVILEGE_ESCALATION_BLOCKED, {
      attempted: "CREATOR_APPROVAL_APPROVE",
      actual: ctx.role,
      path: "requireCreatorApprovalApprove",
    })
    throw new AuthorizationError("Missing permission: creator_approval.approve")
  }
  return ctx
}

export async function requireCreatorApprovalReject(): Promise<AuthContext> {
  const ctx = await requireUser()
  if (
    !roleHasPermission(ctx.role, PERMISSIONS.CREATOR_APPROVAL_REJECT, ctx.customPermissions) &&
    ctx.role !== "FOUNDER"
  ) {
    await logSecurityEvent(AuditActions.SECURITY_PRIVILEGE_ESCALATION_BLOCKED, {
      attempted: "CREATOR_APPROVAL_REJECT",
      actual: ctx.role,
      path: "requireCreatorApprovalReject",
    })
    throw new AuthorizationError("Missing permission: creator_approval.reject")
  }
  return ctx
}

export async function ensureActive(ctx: AuthContext) {
  if (ctx.status === "BANNED") {
    throw new AuthorizationError("Account is banned.")
  }
  if (ctx.status === "SUSPENDED") {
    const u = await prisma.user.findUnique({
      where: { id: ctx.id },
      select: { suspendedUntil: true },
    })
    if (u?.suspendedUntil && u.suspendedUntil > new Date()) {
      throw new AuthorizationError(
        `Account is suspended until ${u.suspendedUntil.toISOString()}.`,
      )
    }
  }
}

export function canModifyUser(actor: AuthContext, targetUserId: string, targetRole?: string | null): boolean {
  if (actor.id === targetUserId) return false
  if (targetRole === ROLES.FOUNDER) return false
  if (actor.role === ROLES.FOUNDER) return true
  if (actor.role === ROLES.ADMIN) {
    if (targetRole === ROLES.FOUNDER || targetRole === ROLES.ADMIN) return false
    return true
  }
  return false
}
