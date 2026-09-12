import { getServerUser } from '@/lib/session'
import { isFounder } from '@/lib/roles'

export async function requireFounderSession() {
  const user = await getServerUser()
  if (!user || !isFounder(user.role)) {
    return { ok: false as const, user: null }
  }
  return { ok: true as const, user }
}

export function founderOr403(user: { role: string } | null) {
  return !user || !isFounder(user.role)
}

export function founderOnly<T extends { role: string }>(user: T | null): user is T {
  return !!user && isFounder(user.role)
}