export const EMAIL_CATEGORIES = {
  SECURITY: "security",
  ACCOUNT: "account",
  ORDERS: "orders",
  REFUNDS: "refunds",
  SUPPORT: "support",
  MODERATION: "moderation",
  CREATOR: "creator",
  PLATFORM: "platform",
  MARKETING: "marketing",
} as const

export type EmailCategory = (typeof EMAIL_CATEGORIES)[keyof typeof EMAIL_CATEGORIES]

export const EMAIL_TEMPLATES = {
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  EMAIL_CHANGED: "EMAIL_CHANGED",
  ACCOUNT_WARNING: "ACCOUNT_WARNING",
  ACCOUNT_BANNED: "ACCOUNT_BANNED",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  WELCOME: "WELCOME",
  ORDER_CONFIRMATION: "ORDER_CONFIRMATION",
  REFUND_REQUESTED: "REFUND_REQUESTED",
  REFUND_APPROVED: "REFUND_APPROVED",
  REFUND_REJECTED: "REFUND_REJECTED",
  REFUND_COMPLETED: "REFUND_COMPLETED",
  PAYOUT_INITIATED: "PAYOUT_INITIATED",
  PAYOUT_COMPLETED: "PAYOUT_COMPLETED",
  PAYOUT_FAILED: "PAYOUT_FAILED",
  CREATOR_APPLICATION_APPROVED: "CREATOR_APPLICATION_APPROVED",
  CREATOR_APPLICATION_REJECTED: "CREATOR_APPLICATION_REJECTED",
  CREATOR_APPLICATION_CHANGES_REQUESTED: "CREATOR_APPLICATION_CHANGES_REQUESTED",
  PRODUCT_UPDATE: "PRODUCT_UPDATE",
  SUPPORT_TICKET_CREATED: "SUPPORT_TICKET_CREATED",
  SUPPORT_TICKET_REPLY: "SUPPORT_TICKET_REPLY",
  SUPPORT_TICKET_RESOLVED: "SUPPORT_TICKET_RESOLVED",
  MODERATION_ACTION: "MODERATION_ACTION",
  APPEAL_RECEIVED: "APPEAL_RECEIVED",
  APPEAL_UPDATE: "APPEAL_UPDATE",
  APPEAL_DECISION: "APPEAL_DECISION",
  TEAM_INVITATION: "TEAM_INVITATION",
  PLATFORM_ANNOUNCEMENT: "PLATFORM_ANNOUNCEMENT",
} as const

export type EmailTemplateKey = (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES]

export const EMAIL_PRIORITIES = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  NORMAL: "NORMAL",
  LOW: "LOW",
} as const

export type EmailPriority = (typeof EMAIL_PRIORITIES)[keyof typeof EMAIL_PRIORITIES]

export const EMAIL_STATUSES = {
  QUEUED: "QUEUED",
  PROCESSING: "PROCESSING",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  BOUNCED: "BOUNCED",
  COMPLAINED: "COMPLAINED",
  CANCELLED: "CANCELLED",
} as const

export type EmailStatus = (typeof EMAIL_STATUSES)[keyof typeof EMAIL_STATUSES]

export interface EmailTemplateData {
  [key: string]: string | number | boolean | null | undefined
}

export interface EmailOptions {
  to: string
  templateKey?: EmailTemplateKey
  data?: EmailTemplateData
  category: EmailCategory
  priority?: EmailPriority
  scheduledAt?: Date
  idempotencyKey?: string
  userId?: string
}

export interface EmailQueueOptions {
  to: string
  templateKey: EmailTemplateKey
  data: EmailTemplateData
  category: EmailCategory
  priority?: EmailPriority
  scheduledAt?: Date
  idempotencyKey?: string
  userId?: string
}
