export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/mailer"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 3, 60 * 1000)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, a verification email has been sent" },
        { status: 200 }
      )
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: "Your email is already verified. You can sign in." },
        { status: 200 }
      )
    }

    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    })

    const token = crypto.randomUUID()
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    })

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`
      await sendEmail(
        user.email,
        "Verify your PawVault account",
        `<p>Click <a href="${verifyUrl}">here</a> to verify your email address. This link expires in 24 hours.</p>`
      )
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
    }

    await createAuditLog({
      userId: user.id,
      action: AuditActions.USER_EMAIL_VERIFIED,
      details: { action: "resend" },
    })

    return NextResponse.json(
      { message: "If an account exists, a verification email has been sent" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}