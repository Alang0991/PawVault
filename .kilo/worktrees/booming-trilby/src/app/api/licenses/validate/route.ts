export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (!key) {
      return NextResponse.json(
        { error: "License key is required" },
        { status: 400 }
      )
    }

    const license = await prisma.license.findUnique({
      where: { licenseKey: key },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    })

    if (!license) {
      return NextResponse.json(
        { valid: false, reason: "License not found" },
        { status: 404 }
      )
    }

    if (license.status === "REVOKED") {
      return NextResponse.json(
        { valid: false, reason: "License has been revoked" },
        { status: 403 }
      )
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, reason: "License has expired" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      valid: true,
      license: {
        key: license.licenseKey,
        status: license.status,
        product: license.product,
        user: license.user,
        createdAt: license.createdAt,
        expiresAt: license.expiresAt,
      },
    })
  } catch (error) {
    console.error("Validate license error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
