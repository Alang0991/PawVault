export const ROLES = {
  FOUNDER: "FOUNDER",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  CREATOR: "CREATOR",
  VERIFIED_CREATOR: "VERIFIED_CREATOR",
  USER: "USER",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_RANK: Record<Role, number> = {
  FOUNDER: 100,
  ADMIN: 80,
  MODERATOR: 60,
  VERIFIED_CREATOR: 50,
  CREATOR: 40,
  USER: 10,
}

export const STAFF_ROLES: Role[] = [ROLES.FOUNDER, ROLES.ADMIN, ROLES.MODERATOR]

export function isStaff(role: string | null | undefined): boolean {
  return STAFF_ROLES.includes(role as Role)
}

export function isFounder(role: string | null | undefined): boolean {
  return role === ROLES.FOUNDER
}

export function isAdminOrFounder(role: string | null | undefined): boolean {
  return role === ROLES.FOUNDER || role === ROLES.ADMIN
}

export function hasRoleAtLeast(actualRole: string | null | undefined, required: Role): boolean {
  if (!actualRole) return false
  const actual = ROLE_RANK[actualRole as Role] ?? 0
  const needed = ROLE_RANK[required] ?? 0
  return actual >= needed
}
