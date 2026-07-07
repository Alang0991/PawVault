import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export interface AuditLogOptions {
  userId?: string
  action: string
  details?: Record<string, any>
  entityType?: string
  entityId?: string
}

export async function createAuditLog(options: AuditLogOptions) {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown'

    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        details: options.details ? JSON.stringify(options.details) : null,
        ipAddress,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging should not break the main flow
  }
}

export async function logUserAction(
  userId: string,
  action: string,
  details?: Record<string, any>
) {
  await createAuditLog({ userId, action, details })
}

export async function logAdminAction(
  userId: string,
  action: string,
  details?: Record<string, any>
) {
  await createAuditLog({ userId, action, details })
}

export async function logSecurityEvent(
  action: string,
  details?: Record<string, any>
) {
  await createAuditLog({ action, details })
}

// Common action constants
export const AuditActions = {
  // User actions
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_PASSWORD_CHANGED: 'USER_PASSWORD_CHANGED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  USER_EMAIL_VERIFIED: 'USER_EMAIL_VERIFIED',
  
  // Product actions
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  PRODUCT_PUBLISHED: 'PRODUCT_PUBLISHED',
  PRODUCT_UNPUBLISHED: 'PRODUCT_UNPUBLISHED',
  
  // Order actions
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_REFUNDED: 'ORDER_REFUNDED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  
  // Admin actions
  ADMIN_USER_BANNED: 'ADMIN_USER_BANNED',
  ADMIN_USER_UNBANNED: 'ADMIN_USER_UNBANNED',
  ADMIN_PRODUCT_REMOVED: 'ADMIN_PRODUCT_REMOVED',
  ADMIN_MODERATION_ACTION: 'ADMIN_MODERATION_ACTION',
  
  // Security events
  SECURITY_LOGIN_FAILED: 'SECURITY_LOGIN_FAILED',
  SECURITY_RATE_LIMIT_EXCEEDED: 'SECURITY_RATE_LIMIT_EXCEEDED',
  SECURITY_SUSPICIOUS_ACTIVITY: 'SECURITY_SUSPICIOUS_ACTIVITY',
  SECURITY_FILE_UPLOAD_REJECTED: 'SECURITY_FILE_UPLOAD_REJECTED',
  FILE_UPLOADED: 'FILE_UPLOADED',
} as const
