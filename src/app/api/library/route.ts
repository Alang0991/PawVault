export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/session"
import { getOwnedProducts } from "@/lib/ownership"

export async function GET() {
  const user = await getServerUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const products = await getOwnedProducts(user.id)
  return NextResponse.json({ products })
}