import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getServerUser() {
  const session = await getServerSession(authOptions)

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
      avatar: true,
      bio: true,
      isVerified: true,
    },
  })

  return user
}

export function requireAuth() {
  return getServerUser()
}
