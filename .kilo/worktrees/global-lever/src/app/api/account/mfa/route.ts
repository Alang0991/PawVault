export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/session"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"
import { generateSecret, generateURI, verify } from "otplib"
import QRCode from "qrcode"
import crypto from "crypto"

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { mfaEnabled: true, mfaSecret: true, mfaBackupCodes: true, email: true, username: true },
    })

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!fullUser.mfaEnabled) {
      return NextResponse.json({ enabled: false, secret: null, backupCodes: null })
    }

    return NextResponse.json({
      enabled: true,
      secret: fullUser.mfaSecret,
      backupCodes: fullUser.mfaBackupCodes ? fullUser.mfaBackupCodes.split(",") : [],
    })
  } catch (error) {
    console.error("Get MFA status error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { mfaEnabled: true, mfaSecret: true, email: true, username: true },
    })

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (fullUser.mfaEnabled) {
      return NextResponse.json({ error: "MFA is already enabled" }, { status: 400 })
    }

    const { token } = await request.json()

    let secret = fullUser.mfaSecret
    if (!secret) {
      secret = generateSecret()
      const otpauth = generateURI({
        issuer: "PawVault",
        label: fullUser.email,
        secret,
      })

      const qrCodeDataUrl = await QRCode.toDataURL(otpauth)

      await prisma.user.update({
        where: { id: user.id },
        data: { mfaSecret: secret },
      })

      return NextResponse.json({ secret, qrCode: qrCodeDataUrl, backupCodes: null })
    }

    const result = await verify({ token, secret })
    const isValid = result.valid

    if (!isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    ).join(",")

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
        mfaBackupCodes: backupCodes,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.SECURITY_SUSPICIOUS_ACTIVITY,
      details: { event: "mfa_enabled" },
    })

    return NextResponse.json({
      enabled: true,
      backupCodes: backupCodes.split(","),
    })
  } catch (error) {
    console.error("Enable MFA error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { mfaEnabled: true, mfaSecret: true, mfaBackupCodes: true, email: true, username: true },
    })

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!fullUser.mfaEnabled) {
      return NextResponse.json({ error: "MFA is not enabled" }, { status: 400 })
    }

    const { token } = await request.json()

    const userWithSecret = await prisma.user.findUnique({
      where: { id: user.id },
      select: { mfaSecret: true },
    })

    if (!userWithSecret?.mfaSecret) {
      return NextResponse.json({ error: "MFA secret not found" }, { status: 400 })
    }

    const result = await verify({ token, secret: userWithSecret.mfaSecret })
    const isValid = result.valid

    if (!isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: AuditActions.SECURITY_SUSPICIOUS_ACTIVITY,
      details: { event: "mfa_disabled" },
    })

    return NextResponse.json({ enabled: false })
  } catch (error) {
    console.error("Disable MFA error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}