import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { roleHasPermission, permissionsForRole } from "@/lib/permissions"
import { ROLES } from "@/lib/roles"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ authenticated: false })
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
        isVerified: true,
        avatar: true,
        bio: true,
        creatorStatus: true,
        creatorTermsAcceptedAt: true,
         customPermissions: true,
         suspendedUntil: true,
         isFeatured: true,
         language: true,
         currency: true,
         theme: true,
         accentColor: true,
         reduceMotion: true,
        store: {
          select: {
            id: true,
            slug: true,
            name: true,
            visibility: true,
          },
        },
      },
    })

    if (!fullUser) {
      return NextResponse.json({ authenticated: false })
    }

    const role = fullUser.role as keyof typeof ROLES
    const baselinePermissions = permissionsForRole(fullUser.role)
    const customPermissionsList = (fullUser.customPermissions || "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    const effectivePermissions = Array.from(
      new Set([...baselinePermissions, ...customPermissionsList])
    )

    const isSuspended =
      fullUser.status === "SUSPENDED" &&
      fullUser.suspendedUntil &&
      new Date(fullUser.suspendedUntil) > new Date()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        username: fullUser.username,
        displayName: fullUser.displayName,
        role: fullUser.role,
        status: isSuspended ? "SUSPENDED" : fullUser.status,
        isVerified: fullUser.isVerified,
        avatar: fullUser.avatar,
        bio: fullUser.bio,
        creatorStatus: fullUser.creatorStatus,
        creatorTermsAcceptedAt: fullUser.creatorTermsAcceptedAt,
        customPermissions: fullUser.customPermissions,
        suspendedUntil: fullUser.suspendedUntil,
         isFeatured: fullUser.isFeatured,
         language: fullUser.language,
         currency: fullUser.currency,
         theme: fullUser.theme,
         accentColor: fullUser.accentColor,
         reduceMotion: fullUser.reduceMotion,
         store: fullUser.store,
      },
      permissions: effectivePermissions,
      features: {
        canCreateProducts: fullUser.creatorStatus === "APPROVED",
        canManageStore: !!fullUser.store,
        isStaff: ["ADMIN", "FOUNDER", "MODERATOR"].includes(fullUser.role),
      },
    })
  } catch (error) {
    console.error("Account state error:", error)
    return NextResponse.json(
      { authenticated: false, error: "Failed to load account state" },
      { status: 500 }
    )
  }
}
