import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export interface AuditLogOptions {
  userId?: string | null
  action: string
  details?: Record<string, any>
  entityType?: string
  entityId?: string
  ipAddress?: string | null
}

export async function createAuditLog(options: AuditLogOptions) {
  try {
    let ip = options.ipAddress
    if (!ip) {
      try {
        const headersList = await headers()
        ip =
          headersList.get('x-forwarded-for') ||
          headersList.get('x-real-ip') ||
          'unknown'
      } catch {
        ip = 'unknown'
      }
    }

    const safeDetails = sanitizeDetails(options.details)

    await prisma.auditLog.create({
      data: {
        userId: options.userId ?? null,
        action: options.action,
        details: safeDetails ? JSON.stringify(safeDetails) : null,
        ipAddress: ip ?? 'unknown',
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

function sanitizeDetails(details?: Record<string, any>): Record<string, any> | null {
  if (!details) return null
  const banned = new Set([
    'password',
    'passwordHash',
    'currentPassword',
    'newPassword',
    'token',
    'sessionToken',
    'secret',
    'cookie',
  ])
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(details)) {
    if (banned.has(k)) {
      out[k] = '[REDACTED]'
    } else {
      out[k] = v
    }
  }
  return out
}

export async function logUserAction(
  userId: string,
  action: string,
  details?: Record<string, any>,
  entity?: { entityType?: string; entityId?: string },
) {
  await createAuditLog({ userId, action, details, ...entity })
}

export async function logAdminAction(
  userId: string,
  action: string,
  details?: Record<string, any>,
  entity?: { entityType?: string; entityId?: string },
) {
  await createAuditLog({ userId, action, details, ...entity })
}

export async function logSecurityEvent(
  action: string,
  details?: Record<string, any>,
) {
  await createAuditLog({ action, details })
}

export const AuditActions = {
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_PASSWORD_CHANGED: 'USER_PASSWORD_CHANGED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  USER_EMAIL_VERIFIED: 'USER_EMAIL_VERIFIED',

  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  PRODUCT_PUBLISHED: 'PRODUCT_PUBLISHED',
  PRODUCT_UNPUBLISHED: 'PRODUCT_UNPUBLISHED',
  PRODUCT_FEATURED: 'PRODUCT_FEATURED',
  PRODUCT_UNFEATURED: 'PRODUCT_UNFEATURED',

  BUNDLE_CREATED: 'BUNDLE_CREATED',
  BUNDLE_UPDATED: 'BUNDLE_UPDATED',
  BUNDLE_DELETED: 'BUNDLE_DELETED',
  BUNDLE_PUBLISHED: 'BUNDLE_PUBLISHED',
  BUNDLE_UNPUBLISHED: 'BUNDLE_UNPUBLISHED',

  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_REFUNDED: 'ORDER_REFUNDED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',

  STAFF_CREATED: 'STAFF_CREATED',
  STAFF_PROMOTED: 'STAFF_PROMOTED',
  STAFF_DEMOTED: 'STAFF_DEMOTED',
  STAFF_REMOVED: 'STAFF_REMOVED',
  STAFF_DISABLED: 'STAFF_DISABLED',
  STAFF_PERMISSIONS_CHANGED: 'STAFF_PERMISSIONS_CHANGED',

  ADMIN_USER_BANNED: 'ADMIN_USER_BANNED',
  ADMIN_USER_UNBANNED: 'ADMIN_USER_UNBANNED',
  ADMIN_USER_SUSPENDED: 'ADMIN_USER_SUSPENDED',
  ADMIN_USER_RESTORED: 'ADMIN_USER_RESTORED',
  ADMIN_PRODUCT_REMOVED: 'ADMIN_PRODUCT_REMOVED',
  ADMIN_PRODUCT_RESTORED: 'ADMIN_PRODUCT_RESTORED',
  ADMIN_MODERATION_ACTION: 'ADMIN_MODERATION_ACTION',

  CREATOR_VERIFIED: 'CREATOR_VERIFIED',
  CREATOR_UNVERIFIED: 'CREATOR_UNVERIFIED',
  CREATOR_FEATURED: 'CREATOR_FEATURED',
  CREATOR_UNFEATURED: 'CREATOR_UNFEATURED',
  CREATOR_APPLICATION_APPROVED: 'CREATOR_APPLICATION_APPROVED',
  CREATOR_APPLICATION_REJECTED: 'CREATOR_APPLICATION_REJECTED',
  CREATOR_APPLICATION_REVIEWED: 'CREATOR_APPLICATION_REVIEWED',
  CREATOR_APPLICATION_SUBMITTED: 'CREATOR_APPLICATION_SUBMITTED',
  CREATOR_SUSPENDED: 'CREATOR_SUSPENDED',
  CREATOR_REINSTATED: 'CREATOR_REINSTATED',
  CREATOR_STATUS_CHANGED: 'CREATOR_STATUS_CHANGED',

  REPORT_CREATED: 'REPORT_CREATED',
  REPORT_RESOLVED: 'REPORT_RESOLVED',
  REPORT_DISMISSED: 'REPORT_DISMISSED',
  REPORT_INVESTIGATING: 'REPORT_INVESTIGATING',
  REVIEW_CREATOR_RESPONSE: 'REVIEW_CREATOR_RESPONSE',

  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_UPDATED: 'CATEGORY_UPDATED',
  CATEGORY_DELETED: 'CATEGORY_DELETED',

  ANNOUNCEMENT_CREATED: 'ANNOUNCEMENT_CREATED',
  ANNOUNCEMENT_PUBLISHED: 'ANNOUNCEMENT_PUBLISHED',
  ANNOUNCEMENT_UPDATED: 'ANNOUNCEMENT_UPDATED',
  ANNOUNCEMENT_DELETED: 'ANNOUNCEMENT_DELETED',

  SETTINGS_UPDATED: 'SETTINGS_UPDATED',

  SECURITY_LOGIN_FAILED: 'SECURITY_LOGIN_FAILED',
  SECURITY_RATE_LIMIT_EXCEEDED: 'SECURITY_RATE_LIMIT_EXCEEDED',
  SECURITY_SUSPICIOUS_ACTIVITY: 'SECURITY_SUSPICIOUS_ACTIVITY',
  SECURITY_FILE_UPLOAD_REJECTED: 'SECURITY_FILE_UPLOAD_REJECTED',
  SECURITY_PRIVILEGE_ESCALATION_BLOCKED: 'SECURITY_PRIVILEGE_ESCALATION_BLOCKED',

  FILE_UPLOADED: 'FILE_UPLOADED',

  STAFF_PICK_CREATED: 'STAFF_PICK_CREATED',
  STAFF_PICK_UPDATED: 'STAFF_PICK_UPDATED',
  STAFF_PICK_DELETED: 'STAFF_PICK_DELETED',

  PAYMENT_TRANSFER_CREATED: 'PAYMENT_TRANSFER_CREATED',
  PAYMENT_TRANSFER_FAILED: 'PAYMENT_TRANSFER_FAILED',
  PAYMENT_REFUND_REQUESTED: 'PAYMENT_REFUND_REQUESTED',
  PAYMENT_REFUND_COMPLETED: 'PAYMENT_REFUND_COMPLETED',
  PAYMENT_PAYOUT_OBSERVED: 'PAYMENT_PAYOUT_OBSERVED',
  PAYMENT_DISPUTE_OPENED: 'PAYMENT_DISPUTE_OPENED',
  PAYMENT_RECONCILIATION_MISMATCH: 'PAYMENT_RECONCILIATION_MISMATCH',
  PAYMENT_WEBHOOK_FAILED: 'PAYMENT_WEBHOOK_FAILED',
  FINANCE_RECONCILE: 'FINANCE_RECONCILE',
  FINANCE_PAYOUT_DISABLE: 'FINANCE_PAYOUT_DISABLE',
  FINANCE_TRANSFER_RETRY: 'FINANCE_TRANSFER_RETRY',
  FINANCE_REFUND_OVERRIDE: 'FINANCE_REFUND_OVERRIDE',
} as const

export async function logFounderAction(
  founderId: string,
  action: string,
  details?: Record<string, any>,
  entity?: { entityType?: string; entityId?: string },
) {
  await createAuditLog({ userId: founderId, action, details, ...entity })
}
