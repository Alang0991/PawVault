export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { uploadFile } from "@/lib/storage"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const result = await uploadFile(
      file,
      { folder: "avatars", userId: user.id, validation: "avatar" },
      request,
    )

    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: result.url },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.USER_PROFILE_UPDATED,
      details: { avatar: result.url },
    })

    return NextResponse.json({ avatar: result.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
