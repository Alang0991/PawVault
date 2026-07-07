import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

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

        let user
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })
        } catch (error) {
          console.error("Login database error:", error)
          console.error("Login database error name:", error instanceof Error ? error.name : "unknown")
          console.error("Login database error message:", error instanceof Error ? error.message : String(error))
          console.error("Login database error stack:", error instanceof Error ? error.stack : "no stack")
          return null
        }

        if (!user) {
          return null
        }

        let isPasswordValid = false
        try {
          isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )
        } catch (error) {
          console.error("Password compare error:", error)
          return null
        }

        if (!isPasswordValid) {
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