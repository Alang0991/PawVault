export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

interface Params {
  params: { id: string }
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = await prisma.store.findUnique({
    where: { userId: user.id },
    select: { id: true, announcements: true },
  })

  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  try {
    const body = await request.json()
    const { title, body: content, isPublished } = body

    const announcements = store.announcements 
      ? JSON.parse(store.announcements) 
      : []

    const index = announcements.findIndex((a: any) => a.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    announcements[index] = {
      ...announcements[index],
      ...(title !== undefined && { title }),
      ...(content !== undefined && { body: content }),
      ...(isPublished !== undefined && { isPublished }),
      updatedAt: new Date().toISOString(),
    }

    await prisma.store.update({
      where: { id: store.id },
      data: { announcements: JSON.stringify(announcements) },
    })

    return NextResponse.json({ announcement: announcements[index] })
  } catch (error) {
    console.error('Update announcement error:', error)
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const store = await prisma.store.findUnique({
    where: { userId: user.id },
    select: { id: true, announcements: true },
  })

  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

  try {
    const announcements = store.announcements 
      ? JSON.parse(store.announcements) 
      : []

    const filtered = announcements.filter((a: any) => a.id !== params.id)

    await prisma.store.update({
      where: { id: store.id },
      data: { announcements: JSON.stringify(filtered) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
  }
}