import { LicenseStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export { LicenseStatus }

export async function createLicenseKey(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments = [4, 4, 4, 4]
  const key = segments.map(() =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  ).join('-')
  return key
}

export async function ensureUniqueLicenseKey(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const key = await createLicenseKey()
    const existing = await prisma.license.findUnique({ where: { licenseKey: key } })
    if (!existing) return key
  }
  const key = await createLicenseKey()
  return key
}