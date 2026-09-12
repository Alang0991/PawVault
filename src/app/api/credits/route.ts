import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const contributors = await prisma.contributor.findMany({
      orderBy: [
        { isFounder: "desc" },
        { isCurrent: "desc" },
        { startDate: "asc" },
      ],
    })

    return NextResponse.json({ contributors })
  } catch (error) {
    console.error("Failed to fetch contributors:", error)
    return NextResponse.json({ error: "Failed to fetch contributors" }, { status: 500 })
  }
}