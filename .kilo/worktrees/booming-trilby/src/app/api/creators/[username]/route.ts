export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface Props {
  params: { username: string }
}

export async function GET(
  _request: Request,
  { params }: Props
) {
  try {
    const creator = await prisma.user.findFirst({
      where: {
        username: params.username,
        creatorStatus: "APPROVED",
        status: "ACTIVE",
        isInternal: false,
        store: {
          visibility: "PUBLISHED",
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        salesCount: true,
        followersCount: true,
        rating: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            banner: true,
            logo: true,
            socialLinks: true,
          },
        },
        _count: {
          select: {
            products: {
              where: { isPublished: true },
            },
            followers: true,
          },
        },
      },
    })

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      creator: {
        id: creator.id,
        username: creator.username,
        displayName: creator.displayName,
        avatar: creator.avatar,
        bio: creator.bio,
        isVerified: creator.isVerified,
        createdAt: creator.createdAt,
        salesCount: creator.salesCount,
        followersCount: creator.followersCount,
        rating: creator.rating,
        store: creator.store,
        productCount: creator._count.products,
        followerCount: creator._count.followers,
      },
    })
  } catch (error) {
    console.error("Get creator error:", error)
    return NextResponse.json(
      { error: "Failed to load creator" },
      { status: 500 }
    )
  }
}
