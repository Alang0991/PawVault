export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { isFounder } from '@/lib/roles'

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user || !isFounder(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sections = await prisma.homepageSection.findMany({
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json({ sections })
  } catch (error) {
    console.error('Get homepage sections error:', error)
    return NextResponse.json({ error: 'Failed to load sections' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user || !isFounder(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, enabled, displayOrder, config, isSeasonal, seasonStart, seasonEnd } = body

    if (!type) {
      return NextResponse.json({ error: 'Section type is required' }, { status: 400 })
    }

    const maxOrder = await prisma.homepageSection.aggregate({
      _max: { displayOrder: true },
    })

    const section = await prisma.homepageSection.create({
      data: {
        type,
        enabled: enabled ?? true,
        displayOrder: displayOrder ?? (maxOrder._max.displayOrder ?? 0) + 1,
        config: config ?? {},
        isSeasonal: isSeasonal ?? false,
        seasonStart: seasonStart ? new Date(seasonStart) : null,
        seasonEnd: seasonEnd ? new Date(seasonEnd) : null,
      },
    })

    return NextResponse.json({ section })
  } catch (error) {
    console.error('Create homepage section error:', error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}