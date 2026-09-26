import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/mailer"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"
import { createAuditLog, AuditActions } from "@/lib/audit-logger"

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  displayName: z.string().max(64).optional(),
})

const RESERVED_USERNAMES = new Set([
  "admin", "administrator", "root", "system", "api", "auth", "login", "signup",
  "signin", "signout", "register", "logout", "dashboard", "creator", "store",
  "pawvault", "paw", "vault", "support", "help", "about", "contact", "terms",
  "privacy", "policy", "billing", "checkout", "cart", "orders", "profile",
  "settings", "account", "verify", "verification", "reset", "forgot",
  "password", "token", "secret", "internal", "null", "undefined", "test",
])

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  try {
    const rateLimitResult = rateLimit(request, 5, 60 * 1000)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: parsed.error.format() },
        { status: 400 }
      )
    }

    let { email, username, password, displayName } = parsed.data

    email = email.trim().toLowerCase()
    username = username.trim().toLowerCase()

    if (!/^[a-z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 }
      )
    }

    if (RESERVED_USERNAMES.has(username)) {
      return NextResponse.json(
        { error: "This username is not allowed" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    })

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username"
      return NextResponse.json(
        { error: `An account with this ${field} already exists` },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          displayName: displayName || username,
          role: "USER",
        },
      })

      await tx.profile.create({
        data: {
          userId: newUser.id,
        },
      })

      await tx.userPreference.create({
        data: {
          userId: newUser.id,
        },
      })

      const verificationToken = crypto.randomUUID()
      await tx.emailVerificationToken.create({
        data: {
          userId: newUser.id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      })

      return { user: newUser, verificationToken }
    })

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const verifyUrl = `${appUrl}/api/auth/verify-email?token=${user.verificationToken}`
      await sendEmail(
        user.user.email,
        "Verify your PawVault account",
        `<p>Welcome to PawVault! Click <a href="${verifyUrl}">here</a> to verify your email address. This link expires in 24 hours.</p>`
      )
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
    }

    await createAuditLog({
      userId: user.user.id,
      action: AuditActions.USER_REGISTERED,
      details: { email, username, ip: clientIp },
    })

    return NextResponse.json(
      {
        user: {
          id: user.user.id,
          email: user.user.email,
          username: user.user.username,
          displayName: user.user.displayName,
        },
        message: "Account created. Please check your email to verify your account.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong creating your account. Please try again." },
      { status: 500 }
    )
  }
}