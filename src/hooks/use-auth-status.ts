"use client"

import { useSession } from "next-auth/react"
import type { Session } from "next-auth"

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"

export interface UseAuthStatusReturn {
  status: AuthStatus
  isAuthenticated: boolean
  isLoading: boolean
  session: Session | null
}

/**
 * Single source of truth for "is this visitor signed in?".
 *
 * NextAuth's `useSession().status` conflates two independent questions:
 * "has the session been resolved yet" and "is there a valid session". Its
 * `update()` path sets an internal loading flag while it round-trips, so
 * `status` transiently reports "loading" for an already-authenticated user,
 * and the session is only ever set to `null` by a genuine sign-out.
 *
 * Reading authentication off that string therefore treats a background session
 * refresh as a logout, which is what made the navbar paint the signed-out UI
 * on every page load. Authentication is therefore derived from the SESSION
 * OBJECT, which is a valid three-state signal:
 *
 *   session == null && next-auth still resolving  -> loading (unknown)
 *   session != null                              -> authenticated
 *   session == null && resolution finished        -> unauthenticated
 *
 * Note there is no "unauthenticated" render while resolution is in flight, so
 * the initial client render always matches the server HTML.
 */
export function useAuthStatus(): UseAuthStatusReturn {
  const { data: session, status: sessionStatus } = useSession()

  const isAuthenticated = session != null
  const isLoading = !isAuthenticated && sessionStatus === "loading"

  const status: AuthStatus = isAuthenticated
    ? "authenticated"
    : isLoading
      ? "loading"
      : "unauthenticated"

  return { status, isAuthenticated, isLoading, session }
}
