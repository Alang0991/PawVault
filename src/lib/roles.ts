export const ROLES = {
  FOUNDER: "FOUNDER",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  SUPPORT: "SUPPORT",
  FINANCE: "FINANCE",
  DEVELOPER: "DEVELOPER",
  CONTENT_MANAGER: "CONTENT_MANAGER",
  MARKETPLACE_MANAGER: "MARKETPLACE_MANAGER",
  CREATOR: "CREATOR",
  VERIFIED_CREATOR: "VERIFIED_CREATOR",
  USER: "USER",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_RANK: Record<Role, number> = {
  FOUNDER: 100,
  ADMIN: 80,
  MODERATOR: 60,
  SUPPORT: 55,
  FINANCE: 55,
  DEVELOPER: 55,
  CONTENT_MANAGER: 55,
  MARKETPLACE_MANAGER: 55,
  VERIFIED_CREATOR: 50,
  CREATOR: 40,
  USER: 10,
}

export const STAFF_ROLES: Role[] = [
  ROLES.FOUNDER,
  ROLES.ADMIN,
  ROLES.MODERATOR,
  ROLES.SUPPORT,
  ROLES.FINANCE,
  ROLES.DEVELOPER,
  ROLES.CONTENT_MANAGER,
  ROLES.MARKETPLACE_MANAGER,
]

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

export function canAccessModeration(role: string | null | undefined): boolean {
  return isStaff(role)
}

export function canSeeInternalAccounts(viewerRole: string | null | undefined): boolean {
  return isFounder(viewerRole)
}

export function roleLabel(role: string | null | undefined): string {
  if (!role) return "Unknown"
  const labels: Record<string, string> = {
    FOUNDER: "Founder",
    ADMIN: "Administrator",
    MODERATOR: "Moderator",
    SUPPORT: "Support",
    FINANCE: "Finance",
    DEVELOPER: "Developer",
    CONTENT_MANAGER: "Content Manager",
    MARKETPLACE_MANAGER: "Marketplace Manager",
    VERIFIED_CREATOR: "Verified Creator",
    CREATOR: "Creator",
    USER: "User",
  }
  return labels[role] ?? role
}

export function roleDescription(role: string | null | undefined): string {
  if (!role) return ""
  const descriptions: Record<string, string> = {
    FOUNDER: "Full platform access. Owner of the marketplace.",
    ADMIN: "Full access except staff management. Can manage most platform features.",
    MODERATOR: "Moderation tools only. Can view users, products, reviews, and reports.",
    SUPPORT: "Customer support access. Can view users, orders, and file support tickets.",
    FINANCE: "Financial access. Can view orders, revenue, payouts, and refunds.",
    DEVELOPER: "Technical access. Can view audit logs, system settings, and API keys.",
    CONTENT_MANAGER: "Content access. Can manage categories, announcements, and featured listings.",
    MARKETPLACE_MANAGER: "Marketplace access. Can manage products, categories, discounts, and featured listings.",
    VERIFIED_CREATOR: "Verified creator with marketplace access.",
    CREATOR: "Standard creator with own storefront and products.",
    USER: "Standard user with browse, purchase, and review access.",
  }
  return descriptions[role] ?? ""
}