export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { createAuditLog, AuditActions } from '@/lib/audit-logger'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getServerUser()
  if (!user || user.role !== 'FOUNDER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const isActive = body?.isActive
  if (typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const pick = await prisma.staffPick.findUnique({ where: { id: params.id } })
  if (!pick) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.staffPick.update({
    where: { id: params.id },
    data: { isActive, note: body.note ?? pick.note },
  })

  await createAuditLog({
    userId: user.id,
    action: AuditActions.STAFF_PICK_CREATED,
    details: { staffPickId: pick.id, productId: pick.productId, isActive },
    entityType: 'staffPick',
    entityId: pick.id,
  })

  return NextResponse.json({ pick: updated })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getServerUser()
  if (!user || user.role !== 'FOUNDER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const pick = await prisma.staffPick.findUnique({ where: { id: params.id } })
  if (!pick) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.staffPick.delete({ where: { id: params.id } })

  await createAuditLog({
    userId: user.id,
    action: AuditActions.STAFF_PICK_CREATED,
    details: { staffPickId: pick.id, productId: pick.productId, deleted: true },
    entityType: 'staffPick',
    entityId: pick.id,
  })

  return NextResponse.json({ ok: true })
}