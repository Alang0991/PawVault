export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { isFounder } from '@/lib/roles'

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user || !isFounder(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { sectionIds } = body // array of section IDs in new order

    if (!Array.isArray(sectionIds)) {
      return NextResponse.json({ error: 'sectionIds array required' }, { status: 400 })
    }

    await prisma.$transaction(
      sectionIds.map((id, index) =>
        prisma.homepageSection.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder homepage sections error:', error)
    return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 })
  }
}