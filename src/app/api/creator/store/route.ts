export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/session"
import { resolveCreatorStore } from "@/lib/store-resolution"

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await resolveCreatorStore(user.id)

    switch (result.status) {
      case "STORE_FOUND":
        return NextResponse.json({
          store: result.store,
          hasStore: true,
        })
      case "STORE_NOT_FOUND":
        return NextResponse.json({
          store: null,
          hasStore: false,
          canCreate: true,
        })
      case "NOT_AUTHENTICATED":
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      case "CREATOR_NOT_APPROVED":
        return NextResponse.json({
          error: "Creator account required",
          details: result.creatorStatus,
          code: "CREATOR_NOT_APPROVED",
        }, { status: 403 })
      case "CREATOR_SUSPENDED":
        return NextResponse.json({
          error: "Creator account is suspended",
          code: "CREATOR_SUSPENDED",
        }, { status: 403 })
      case "USER_SUSPENDED":
        return NextResponse.json({
          error: "Account is suspended",
          code: "USER_SUSPENDED",
        }, { status: 403 })
      case "USER_BANNED":
        return NextResponse.json({
          error: "Account is banned",
          code: "USER_BANNED",
        }, { status: 403 })
      case "STORE_SUSPENDED":
        return NextResponse.json({
          error: "Store is suspended",
          code: "STORE_SUSPENDED",
        }, { status: 403 })
      case "DATABASE_ERROR":
        return NextResponse.json({
          error: "Failed to load store",
          code: "DATABASE_ERROR",
        }, { status: 500 })
      default:
        return NextResponse.json({
          error: "Unknown error",
        }, { status: 500 })
    }
  } catch (error) {
    console.error("Get creator store error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
