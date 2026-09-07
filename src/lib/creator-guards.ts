import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"

export async function invalidateUserSessions(userId: string) {
  try {
    await prisma.session.deleteMany({
      where: { userId },
    })
  } catch (error) {
    console.error("Failed to invalidate sessions:", error)
  }
}

export async function requireActiveCreator(): Promise<{
  id: string
  email: string
  username: string
  displayName: string | null
  role: string
  status: string
  creatorStatus: string
}> {
  const user = await getServerUser()
  if (!user) {
    throw new Error("Authentication required.")
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      role: true,
      status: true,
      creatorStatus: true,
    },
  })

  if (!fullUser) {
    throw new Error("User not found.")
  }

  if (fullUser.status === "BANNED") {
    throw new Error("Account is banned.")
  }

  if (fullUser.status === "SUSPENDED") {
    const suspendedUntil = (fullUser as any).suspendedUntil as Date | null | undefined
    if (suspendedUntil && suspendedUntil > new Date()) {
      throw new Error(`Account is suspended until ${suspendedUntil.toISOString()}.`)
    }
  }

  const creatorStatus = (fullUser as any).creatorStatus ?? "NONE"
  if (["SUSPENDED", "BANNED"].includes(creatorStatus)) {
    throw new Error("Creator account is suspended.")
  }

  if (creatorStatus !== "APPROVED") {
    throw new Error("Creator account required.")
  }

  return {
    id: fullUser.id,
    email: fullUser.email,
    username: fullUser.username,
    displayName: fullUser.displayName ?? null,
    role: fullUser.role,
    status: fullUser.status,
    creatorStatus,
  }
}

export function isProductVisible(product: {
  status: string
  isPublished: boolean
}) {
  return product.status === "PUBLISHED" && product.isPublished
}

export function canAccessProduct(product: {
  status: string
  isPublished: boolean
  creatorId: string
}, userId: string | null, userRole: string | null) {
  if (isProductVisible(product)) return true
  if (userId && product.creatorId === userId) return true
  if (userRole === "ADMIN" || userRole === "FOUNDER") return true
  return false
}
