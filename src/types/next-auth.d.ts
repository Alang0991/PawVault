import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role?: string | null
      avatar?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string | null
  }
}
