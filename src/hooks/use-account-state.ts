"use client"

import { useEffect, useRef, useCallback, useState, useMemo } from "react"
import { useSession } from "next-auth/react"

export interface AccountState {
  authenticated: boolean
  user: {
    id: string
    email: string
    username: string
    displayName: string | null
    role: string
    status: string
    isVerified: boolean
    avatar: string | null
    bio: string | null
    creatorStatus: string
    creatorTermsAcceptedAt: string | null
     customPermissions: string | null
     suspendedUntil: string | null
     isFeatured: boolean
     language: string | null
     currency: string | null
     theme: string | null
     accentColor: string | null
     reduceMotion: boolean | null
     store: { id: string; slug: string; name: string; visibility: string } | null
  }
  permissions: string[]
  features: {
    canCreateProducts: boolean
    canManageStore: boolean
    isStaff: boolean
  }
}

export interface UseAccountStateReturn {
  account: AccountState | null
  isLoading: boolean
  error: string | null
  refreshCurrentAccount: () => Promise<void>
}

function createEmptyAccountState(): AccountState {
  return {
    authenticated: false,
    user: {
      id: "",
      email: "",
      username: "",
      displayName: null,
      role: "",
      status: "",
      isVerified: false,
      avatar: null,
      bio: null,
      creatorStatus: "",
      creatorTermsAcceptedAt: null,
      customPermissions: null,
      suspendedUntil: null,
      isFeatured: false,
      language: null,
      currency: null,
      theme: null,
      accentColor: null,
      reduceMotion: null,
      store: null,
    },
    permissions: [],
    features: {
      canCreateProducts: false,
      canManageStore: false,
      isStaff: false,
    },
  }
}

export function useAccountState(): UseAccountStateReturn {
  const { data: session, status: sessionStatus, update: updateSession } = useSession()
  // The server-resolved account payload. This is ENRICHMENT ONLY: it fills in
  // fields the JWT does not carry (displayName, avatar, bio, store...). It is
  // never used to decide whether the user is authenticated.
  const [profile, setProfile] = useState<AccountState | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(sessionStatus !== "unauthenticated")
  const [error, setError] = useState<string | null>(null)
  const refreshToken = useRef(0)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const isMountedRef = useRef(true)

  const sessionUser = session?.user
  const isAuthenticated = sessionStatus === "authenticated"

  /**
   * Identity derived from the session alone. The session is provided by the
   * server on first render, so this is correct immediately and stays stable
   * across renders (useMemo keeps the object identity constant, which is what
   * previously caused the effect below to re-run on every render).
   */
  const sessionAccountState = useMemo<AccountState | null>(() => {
    if (!isAuthenticated || !sessionUser) return null
    return {
      authenticated: true,
      user: {
        id: sessionUser.id || "",
        email: sessionUser.email || "",
        username: sessionUser.name || "",
        displayName: sessionUser.name || null,
        role: (sessionUser as any).role || "",
        // These four are placeholders that the real payload always overwrites.
        // They are never used for authorisation decisions.
        status: "ACTIVE",
        isVerified: false,
        bio: null,
        creatorStatus: "",
        creatorTermsAcceptedAt: null,
        customPermissions: null,
        suspendedUntil: null,
        isFeatured: false,
        language: null,
        currency: null,
        theme: null,
        accentColor: null,
        reduceMotion: null,
        store: null,
        avatar: sessionUser.image || null,
      },
      permissions: (sessionUser as any).permissions || [],
      features: (sessionUser as any).features || {
        canCreateProducts: false,
        canManageStore: false,
        isStaff: false,
      },
    }
  }, [isAuthenticated, sessionUser])

  const fetchAccountState = useCallback(
    async (isBackground = false) => {
      refreshToken.current += 1
      const currentToken = refreshToken.current

      try {
        if (!isBackground) setError(null)

        const res = await fetch("/api/account/state", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        })

        if (!res.ok) {
          if (res.status === 401) {
            if (currentToken === refreshToken.current && isMountedRef.current) {
              setProfile(null)
              setIsProfileLoading(false)
            }
            return
          }
          throw new Error(`HTTP ${res.status}`)
        }

        const data = (await res.json()) as AccountState

        if (currentToken !== refreshToken.current || !isMountedRef.current) return

        setProfile(data)
        setError(null)

        const sessionUpdate = res.headers.get("x-session-update")
        if (sessionUpdate) {
          try {
            const updateData = JSON.parse(sessionUpdate)
            await updateSession(updateData)
          } catch {
            // Ignore update errors
          }
        }
      } catch (err) {
        if (currentToken !== refreshToken.current || !isMountedRef.current) return
        if (!isBackground) {
          setError(err instanceof Error ? err.message : "Failed to load account state")
        }
      } finally {
        if (currentToken === refreshToken.current && isMountedRef.current) {
          setIsProfileLoading(false)
        }
      }
    },
    [updateSession],
  )

  /**
   * Fetch the richer profile only once the session is actually authenticated.
   * Note the absence of `account`/`sessionAccountState` from the dependency
   * array: they were mutable values, so including them re-ran this effect on
   * every render and re-triggered the fetch in a loop.
   */
  useEffect(() => {
    isMountedRef.current = true

    if (!isAuthenticated) {
      setProfile(null)
      setIsProfileLoading(false)
      setError(null)
      return
    }

    void fetchAccountState()

    const interval = setInterval(() => void fetchAccountState(true), 60_000)

    return () => {
      clearInterval(interval)
      isMountedRef.current = false
    }
  }, [isAuthenticated, fetchAccountState])

  useEffect(() => {
    const bc = new BroadcastChannel("pawvault-account-sync")
    channelRef.current = bc

    bc.onmessage = (event) => {
      if (event.data?.type === "account-updated" && isAuthenticated) {
        void fetchAccountState()
      }
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "pawvault-account-sync" && isAuthenticated) {
        void fetchAccountState()
      }
    }
    window.addEventListener("storage", onStorage)

    const onFocus = () => {
      if (isAuthenticated) {
        void fetchAccountState(true)
      }
    }
    window.addEventListener("focus", onFocus)

    return () => {
      bc.close()
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("focus", onFocus)
    }
  }, [isAuthenticated, fetchAccountState])

  // Server payload wins where it has real data; session fills the gaps. The
  // merged object is memoised so consumers see a stable identity.
  const account = useMemo<AccountState | null>(() => {
    if (!isAuthenticated) return null
    if (!profile) return sessionAccountState
    if (!sessionAccountState) return profile
    return {
      authenticated: true,
      user: { ...sessionAccountState.user, ...profile.user },
      permissions: profile.permissions?.length ? profile.permissions : sessionAccountState.permissions,
      features: { ...sessionAccountState.features, ...profile.features },
    }
  }, [isAuthenticated, profile, sessionAccountState])

  // isLoading describes the optional profile fetch, not authentication. Auth is
  // already known synchronously.
  const isLoading = isProfileLoading

  return { account, isLoading, error, refreshCurrentAccount: fetchAccountState }
}