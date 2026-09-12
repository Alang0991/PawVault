export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { isFounder } from '@/lib/roles'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user || !isFounder(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, enabled, displayOrder, config, isSeasonal, seasonStart, seasonEnd } = body

    const section = await prisma.homepageSection.update({
      where: { id: params.id },
      data: {
        ...(type !== undefined && { type }),
        ...(enabled !== undefined && { enabled }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(config !== undefined && { config }),
        ...(isSeasonal !== undefined && { isSeasonal }),
        ...(seasonStart !== undefined && { seasonStart: seasonStart ? new Date(seasonStart) : null }),
        ...(seasonEnd !== undefined && { seasonEnd: seasonEnd ? new Date(seasonEnd) : null }),
      },
    })

    return NextResponse.json({ section })
  } catch (error) {
    console.error('Update homepage section error:', error)
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerUser()
    if (!user || !isFounder(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.homepageSection.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete homepage section error:', error)
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}