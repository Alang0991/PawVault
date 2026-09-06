import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const isProduction = process.env.NODE_ENV === "production"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const normalizedEmail = credentials.email.trim().toLowerCase()

        let user
        try {
          user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          })
        } catch (error) {
          console.error("Login database error:", error)
          return null
        }

        if (!user) {
          return null
        }

        if ((user as any).status === "BANNED") {
          return null
        }
        if ((user as any).status === "SUSPENDED") {
          const until = (user as any).suspendedUntil as Date | null | undefined
          if (until && new Date(until) > new Date()) {
            return null
          }
        }

        if (user.passwordHash?.startsWith("$2a$") || user.passwordHash?.startsWith("$2b$")) {
          try {
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.passwordHash
            )
            if (!isPasswordValid) {
              return null
            }
          } catch (error) {
            console.error("Password compare error:", error)
            return null
          }
        } else {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.username,
          role: user.role ?? null,
        }
      },
    }),

    ...(process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true" &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    ...(process.env.NEXT_PUBLIC_DISCORD_AUTH_ENABLED === "true" &&
      process.env.DISCORD_CLIENT_ID &&
      process.env.DISCORD_CLIENT_SECRET
      ? [
          DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            ...(process.env.DISCORD_CALLBACK_URL
              ? { callbackUrl: process.env.DISCORD_CALLBACK_URL }
              : {}),
          }),
        ]
      : []),
  ],

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role ?? null
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? ""
        session.user.role = token.role ?? null
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}