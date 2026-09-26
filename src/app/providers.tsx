"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  // Passing the server-resolved session means useSession() is correct on the very
  // first client render, matching the server HTML exactly. Without this the
  // provider starts in `status: "loading"` and every auth consumer flickers.
  return <SessionProvider session={session}>{children}</SessionProvider>
}
