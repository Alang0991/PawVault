import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function getServerUser() {
  const session = await getServerSession(authOptions)
  
  if (!session || !(session.user as any)?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
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
