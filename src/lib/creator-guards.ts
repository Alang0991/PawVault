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

  if (user.status === "BANNED") {
    throw new Error("Account is banned.")
  }

  if (user.status === "SUSPENDED") {
    const suspendedUntil = user.suspendedUntil as Date | null | undefined
    if (suspendedUntil && suspendedUntil > new Date()) {
      throw new Error(`Account is suspended until ${suspendedUntil.toISOString()}.`)
    }
  }

  const creatorStatus = user.creatorStatus ?? "NONE"

  if (creatorStatus === "SUSPENDED") {
    throw new Error("Creator account is suspended.")
  }

  if (creatorStatus === "BANNED") {
    throw new Error("Creator account is banned.")
  }

  if (creatorStatus !== "APPROVED") {
    const statusMessages: Record<string, string> = {
      NONE: "You need to apply and be approved as a creator.",
      APPLICATION_DRAFT: "Your creator application is not yet submitted.",
      APPLICATION_SUBMITTED: "Your creator application has been submitted.",
      UNDER_REVIEW: "Your creator application is under review.",
      REJECTED: "Your creator application was rejected.",
      WITHDRAWN: "Your creator application was withdrawn.",
    }
    throw new Error(statusMessages[creatorStatus] || "Creator account required.")
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName ?? null,
    role: user.role,
    status: user.status,
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
