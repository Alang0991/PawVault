import bcrypt from 'bcryptjs'
import { formatCurrency } from "@/lib/currency"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

export function formatPrice(amount: number, currency = 'USD', locale?: string): string {
  return formatCurrency(amount, currency, locale)
}

export function formatDate(date: Date | string, locale?: string): string {
  return new Intl.DateTimeFormat(locale || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}
