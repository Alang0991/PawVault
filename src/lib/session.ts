import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Session } from "next-auth"

/**
 * The single authoritative server-side session read.
 *
 * Returns the raw NextAuth session (carrying id, role, email, permissions and
 * features) so it can be handed to the client SessionProvider during SSR. That
 * removes the client-side /api/auth/session round-trip, which is what caused the
 * signed-out -> signed-in flicker on first paint.
 */
export async function getServerAuthSession(): Promise<Session | null> {
  try {
    return await getServerSession(authOptions)
  } catch {
    return null
  }
}

export async function getServerUser() {
  const session = await getServerAuthSession()

  if (!session || !session.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      role: true,
      status: true,
      avatar: true,
      bio: true,
      isVerified: true,
      customPermissions: true,
      creatorStatus: true,
      creatorTermsAcceptedAt: true,
      suspendedUntil: true,
    },
  })

  return user
}

export function requireAuth() {
  return getServerUser()
}
