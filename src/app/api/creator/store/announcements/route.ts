export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
    
    return NextResponse.json({ announcements })
  } catch {
    return NextResponse.json({ announcements: [] })
  }
}

export async function POST(request: Request) {
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

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }

    const announcements = store.announcements 
      ? JSON.parse(store.announcements) 
      : []

    const newAnnouncement = {
      id: crypto.randomUUID(),
      title,
      body: content,
      isPublished: !!isPublished,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [newAnnouncement, ...announcements]

    await prisma.store.update({
      where: { id: store.id },
      data: { announcements: JSON.stringify(updated) },
    })

    return NextResponse.json({ announcement: newAnnouncement }, { status: 201 })
  } catch (error) {
    console.error('Create announcement error:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}