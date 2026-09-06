import { Role, ROLES } from "@/lib/roles"

export const PERMISSIONS = {
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",
  USERS_BAN: "users.ban",
  USERS_UNBAN: "users.unban",
  USERS_SUSPEND: "users.suspend",

  PRODUCTS_VIEW: "products.view",
  PRODUCTS_MANAGE: "products.manage",
  PRODUCTS_REMOVE: "products.remove",
  PRODUCTS_FEATURE: "products.feature",
  PRODUCTS_UNFEATURE: "products.unfeature",
  PRODUCTS_RESTORE: "products.restore",

  CREATORS_VIEW: "creators.view",
  CREATORS_VERIFY: "creators.verify",
  CREATORS_MANAGE: "creators.manage",
  CREATORS_FEATURE: "creators.feature",

  ORDERS_VIEW: "orders.view",
  ORDERS_MANAGE: "orders.manage",
  REFUNDS_MANAGE: "refunds.manage",

  REVIEWS_VIEW: "reviews.view",
  REVIEWS_REMOVE: "reviews.remove",

  REPORTS_VIEW: "reports.view",
  REPORTS_RESOLVE: "reports.resolve",

  CATEGORIES_MANAGE: "categories.manage",

  DISCOUNTS_MANAGE: "discounts.manage",

  FEATURED_MANAGE: "featured.manage",

  ANNOUNCEMENTS_MANAGE: "announcements.manage",

  STAFF_VIEW: "staff.view",
  STAFF_MANAGE: "staff.manage",

  SETTINGS_MANAGE: "settings.manage",

  AUDIT_LOGS_VIEW: "audit_logs.view",

  MARKETPLACE_SETTINGS: "marketplace.settings",
  SITE_SETTINGS: "site.settings",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const PERMISSION_GROUPS: Array<{
  label: string
  description: string
  permissions: Array<{ key: Permission; label: string; description: string }>
}> = [
  {
    label: "Users",
    description: "Manage platform users, bans, and suspensions.",
    permissions: [
      { key: PERMISSIONS.USERS_VIEW, label: "View users", description: "See the user list and user profiles." },
      { key: PERMISSIONS.USERS_MANAGE, label: "Manage users", description: "Edit user profiles and details." },
      { key: PERMISSIONS.USERS_BAN, label: "Ban users", description: "Permanently ban accounts." },
      { key: PERMISSIONS.USERS_UNBAN, label: "Unban users", description: "Restore banned accounts." },
      { key: PERMISSIONS.USERS_SUSPEND, label: "Suspend users", description: "Temporarily suspend accounts." },
    ],
  },
  {
    label: "Products",
    description: "Review, moderate, and feature products.",
    permissions: [
      { key: PERMISSIONS.PRODUCTS_VIEW, label: "View products", description: "Browse the product catalog." },
      { key: PERMISSIONS.PRODUCTS_MANAGE, label: "Manage products", description: "Edit any product." },
      { key: PERMISSIONS.PRODUCTS_REMOVE, label: "Remove products", description: "Unpublish or delete products." },
      { key: PERMISSIONS.PRODUCTS_FEATURE, label: "Feature products", description: "Mark products as featured." },
      { key: PERMISSIONS.PRODUCTS_UNFEATURE, label: "Unfeature products", description: "Remove featured status." },
      { key: PERMISSIONS.PRODUCTS_RESTORE, label: "Restore products", description: "Restore removed products." },
    ],
  },
  {
    label: "Creators",
    description: "Verify and manage creator accounts.",
    permissions: [
      { key: PERMISSIONS.CREATORS_VIEW, label: "View creators", description: "Browse creator directory." },
      { key: PERMISSIONS.CREATORS_VERIFY, label: "Verify creators", description: "Grant verified creator status." },
      { key: PERMISSIONS.CREATORS_MANAGE, label: "Manage creators", description: "Edit creator profiles." },
      { key: PERMISSIONS.CREATORS_FEATURE, label: "Feature creators", description: "Mark creators as featured." },
    ],
  },
  {
    label: "Orders & Refunds",
    description: "Inspect orders and handle refunds.",
    permissions: [
      { key: PERMISSIONS.ORDERS_VIEW, label: "View orders", description: "See order details." },
      { key: PERMISSIONS.ORDERS_MANAGE, label: "Manage orders", description: "Update order status." },
      { key: PERMISSIONS.REFUNDS_MANAGE, label: "Manage refunds", description: "Approve or deny refund requests." },
    ],
  },
  {
    label: "Reviews & Reports",
    description: "Moderate reviews and reported content.",
    permissions: [
      { key: PERMISSIONS.REVIEWS_VIEW, label: "View reviews", description: "See all reviews." },
      { key: PERMISSIONS.REVIEWS_REMOVE, label: "Remove reviews", description: "Delete inappropriate reviews." },
      { key: PERMISSIONS.REPORTS_VIEW, label: "View reports", description: "See moderation reports." },
      { key: PERMISSIONS.REPORTS_RESOLVE, label: "Resolve reports", description: "Act on moderation reports." },
    ],
  },
  {
    label: "Marketplace",
    description: "Categories, discounts, featured listings.",
    permissions: [
      { key: PERMISSIONS.CATEGORIES_MANAGE, label: "Manage categories", description: "Add, edit, remove categories." },
      { key: PERMISSIONS.DISCOUNTS_MANAGE, label: "Manage discounts", description: "Create discounts and coupons." },
      { key: PERMISSIONS.FEATURED_MANAGE, label: "Manage featured", description: "Curate featured listings." },
    ],
  },
  {
    label: "Communication",
    description: "Platform announcements and news.",
    permissions: [
      { key: PERMISSIONS.ANNOUNCEMENTS_MANAGE, label: "Manage announcements", description: "Publish official posts." },
    ],
  },
  {
    label: "Staff",
    description: "Manage moderators and admins.",
    permissions: [
      { key: PERMISSIONS.STAFF_VIEW, label: "View staff", description: "See staff and moderator list." },
      { key: PERMISSIONS.STAFF_MANAGE, label: "Manage staff", description: "Add, remove, promote, demote staff." },
    ],
  },
  {
    label: "Settings & Audit",
    description: "Site configuration and audit log.",
    permissions: [
      { key: PERMISSIONS.SETTINGS_MANAGE, label: "Manage settings", description: "Edit platform settings." },
      { key: PERMISSIONS.MARKETPLACE_SETTINGS, label: "Marketplace settings", description: "Configure marketplace rules." },
      { key: PERMISSIONS.SITE_SETTINGS, label: "Site settings", description: "Configure site-wide options." },
      { key: PERMISSIONS.AUDIT_LOGS_VIEW, label: "View audit logs", description: "Inspect administrative actions." },
    ],
  },
]

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  FOUNDER: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.USERS_BAN,
    PERMISSIONS.USERS_UNBAN,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.PRODUCTS_REMOVE,
    PERMISSIONS.PRODUCTS_FEATURE,
    PERMISSIONS.PRODUCTS_UNFEATURE,
    PERMISSIONS.PRODUCTS_RESTORE,
    PERMISSIONS.CREATORS_VIEW,
    PERMISSIONS.CREATORS_VERIFY,
    PERMISSIONS.CREATORS_MANAGE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.REFUNDS_MANAGE,
    PERMISSIONS.REVIEWS_VIEW,
    PERMISSIONS.REVIEWS_REMOVE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_RESOLVE,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.DISCOUNTS_MANAGE,
    PERMISSIONS.FEATURED_MANAGE,
    PERMISSIONS.ANNOUNCEMENTS_MANAGE,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.MARKETPLACE_SETTINGS,
    PERMISSIONS.SITE_SETTINGS,
    PERMISSIONS.AUDIT_LOGS_VIEW,
  ],
  MODERATOR: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_REMOVE,
    PERMISSIONS.PRODUCTS_RESTORE,
    PERMISSIONS.CREATORS_VIEW,
    PERMISSIONS.REVIEWS_VIEW,
    PERMISSIONS.REVIEWS_REMOVE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_RESOLVE,
  ],
  CREATOR: [],
  USER: [],
}

export function permissionsForRole(role: string | null | undefined): Permission[] {
  if (!role) return []
  return ROLE_PERMISSIONS[role as Role] ?? []
}

export function roleHasPermission(
  role: string | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false
  if (role === ROLES.FOUNDER) return true
  return permissionsForRole(role).includes(permission)
}

export function isFounderRole(role: string | null | undefined): boolean {
  return role === ROLES.FOUNDER
}
