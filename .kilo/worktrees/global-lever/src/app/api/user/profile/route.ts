export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { z } from "zod"

const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores")
    .optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  location: z.string().max(100).optional(),
  socialLinks: z.record(z.string()).optional(),
})

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    return NextResponse.json({
      user: { ...user, profile },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateProfileSchema.parse(body)

    if (validated.username && validated.username !== user.username) {
      const existing = await prisma.user.findUnique({
        where: { username: validated.username },
      })
      if (existing) {
        return NextResponse.json(
          { error: "That username is already taken" },
          { status: 409 },
        )
      }
    }

    const [updatedUser, updatedProfile] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          displayName: validated.displayName,
          username: validated.username,
          bio: validated.bio,
          website: validated.website,
          location: validated.location,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          bio: true,
          website: true,
          location: true,
          avatar: true,
          role: true,
          isVerified: true,
        },
      }),
      prisma.profile.upsert({
        where: { userId: user.id },
        update: {
          bio: validated.bio,
          website: validated.website,
          socialLinks: validated.socialLinks ? JSON.stringify(validated.socialLinks) : null,
        },
        create: {
          userId: user.id,
          bio: validated.bio,
          website: validated.website,
          socialLinks: validated.socialLinks ? JSON.stringify(validated.socialLinks) : null,
        },
      }),
    ])

    return NextResponse.json({
      user: { ...updatedUser, profile: updatedProfile },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
