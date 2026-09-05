import { prisma } from '@/lib/prisma'
import { LicenseStatus } from '@prisma/client'

export interface OwnershipCheck {
  hasAccess: boolean
  licenseStatus: LicenseStatus | null
  orderStatus: string | null
  isCreator: boolean
}

export async function hasProductAccess(userId: string, productId: string): Promise<OwnershipCheck> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { creatorId: true },
  })

  if (!product) {
    return { hasAccess: false, licenseStatus: null, orderStatus: null, isCreator: false }
  }

  if (product.creatorId === userId) {
    return { hasAccess: true, licenseStatus: null, orderStatus: null, isCreator: true }
  }

  const order = await prisma.order.findFirst({
    where: {
      buyerId: userId,
      status: { in: ['PAID', 'COMPLETED'] },
      items: { some: { productId } },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!order) {
    return { hasAccess: false, licenseStatus: null, orderStatus: null, isCreator: false }
  }

  const license = await prisma.license.findFirst({
    where: { userId, productId },
  })

  const hasAccess = license ? license.status === 'ACTIVE' : true

  return {
    hasAccess,
    licenseStatus: license?.status ?? null,
    orderStatus: order.status,
    isCreator: false,
  }
}

export async function getOwnedProducts(userId: string) {
  const licenses = await prisma.license.findMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      product: {
        include: {
          media: { where: { isThumbnail: true }, take: 1 },
          creator: { select: { id: true, username: true, displayName: true } },
        },
      },
      order: { select: { id: true, createdAt: true, total: true, currency: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return licenses.map((l) => ({
    licenseId: l.id,
    licenseKey: l.licenseKey,
    lastAccessedAt: l.lastAccessedAt,
    createdAt: l.createdAt,
    orderId: l.orderId,
    orderDate: l.order.createdAt,
    orderTotal: l.order.total,
    orderCurrency: l.order.currency,
    product: l.product,
  }))
}

export async function getLicense(userId: string, productId: string) {
  return prisma.license.findFirst({
    where: { userId, productId },
    include: {
      product: {
        include: {
          media: { where: { isThumbnail: true }, take: 1 },
          creator: { select: { id: true, username: true, displayName: true } },
        },
      },
      order: { select: { id: true, createdAt: true, total: true, currency: true, status: true } },
    },
  })
}

export async function createLicenseForPurchase(userId: string, productId: string, orderId: string): Promise<string> {
  const existing = await prisma.license.findFirst({
    where: { userId, productId },
  })

  if (existing) {
    return existing.licenseKey
  }

  const licenseKey = generateLicenseKey()
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { version: true },
  })

  return prisma.license.create({
    data: {
      userId,
      productId,
      orderId,
      licenseKey,
      status: 'ACTIVE',
    },
  }).then((l) => l.licenseKey)
}

export async function updateLicenseStatus(userId: string, productId: string, status: LicenseStatus) {
  const data: Record<string, any> = { status }
  if (status === 'REFUNDED') data.refundedAt = new Date()
  if (status === 'DISPUTED') data.disputedAt = new Date()
  if (status === 'SUSPENDED') data.suspendedAt = new Date()

  await prisma.license.updateMany({
    where: { userId, productId },
    data,
  })
}

export async function recordLicenseAccess(userId: string, productId: string) {
  await prisma.license.updateMany({
    where: { userId, productId },
    data: { lastAccessedAt: new Date() },
  })
}

export async function getProductOwners(productId: string) {
  const licenses = await prisma.license.findMany({
    where: { productId, status: 'ACTIVE' },
    include: {
      user: { select: { id: true, email: true, username: true, displayName: true } },
      order: { select: { id: true, createdAt: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return licenses
}

export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments = [4, 4, 4, 4]
  const key = segments.map(() =>
    Array.from({ length: 4 }, () => {
      const idx = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000 * chars.length)
      return chars[idx]
    }).join('')
  ).join('-')
  return key
}